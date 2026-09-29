import pool from "../database/connection";

interface CreateBookingData {
    customerId: string;
    serviceId: string;
    bookingDate: string;
    startTime: string;
}


// =========================================================
// CREATE BOOKING
// =========================================================

export async function createBooking(
    data: CreateBookingData
) {
    const {
        customerId,
        serviceId,
        bookingDate,
        startTime
    } = data;

    // Get the service and its duration
    const serviceResult = await pool.query(
        `SELECT
            id,
            business_id,
            duration
         FROM services
         WHERE id = $1`,
        [serviceId]
    );

    if (serviceResult.rows.length === 0) {
        throw new Error("Service not found");
    }

    const service = serviceResult.rows[0];

    // Validate booking date
    const bookingDateObject = new Date(
        `${bookingDate}T00:00:00`
    );

    // Get today's date in Pakistan time
    const pakistanNow = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Karachi"
        })
    );

    const todayDate =
        `${pakistanNow.getFullYear()}-${String(
            pakistanNow.getMonth() + 1
        ).padStart(2, "0")}-${String(
            pakistanNow.getDate()
        ).padStart(2, "0")}`;

    // Prevent booking on a past date
    if (bookingDate < todayDate) {
        throw new Error(
            "Cannot create a booking for a past date"
        );
    }

    if (Number.isNaN(bookingDateObject.getTime())) {
        throw new Error("Invalid booking date");
    }

    // Get the day of the week
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = bookingDateObject.getDay();

    // Get business working hours for that day
    const availabilityResult = await pool.query(
        `SELECT
            start_time,
            end_time
         FROM availability
         WHERE business_id = $1
           AND day_of_week = $2
         ORDER BY start_time ASC`,
        [
            service.business_id,
            dayOfWeek
        ]
    );

    if (availabilityResult.rows.length === 0) {
        throw new Error(
            "Business is closed on this day"
        );
    }

    // Validate start time format
    const timeParts = startTime
        .split(":")
        .map(Number);

    if (
        timeParts.length !== 2 ||
        timeParts.some(Number.isNaN) ||
        timeParts[0] < 0 ||
        timeParts[0] > 23 ||
        timeParts[1] < 0 ||
        timeParts[1] > 59
    ) {
        throw new Error("Invalid start time");
    }

    const [hours, minutes] = timeParts;

    // Calculate booking end time
    const startMinutes =
        hours * 60 + minutes;

    const endMinutes =
        startMinutes + service.duration;

    if (endMinutes > 24 * 60) {
        throw new Error(
            "Booking time exceeds the end of the day"
        );
    }

    const endHours =
        Math.floor(endMinutes / 60);

    const endMins =
        endMinutes % 60;

    const endTime =
        `${String(endHours).padStart(2, "0")}:${String(
            endMins
        ).padStart(2, "0")}`;

    const normalizedStartTime =
        `${String(hours).padStart(2, "0")}:${String(
            minutes
        ).padStart(2, "0")}`;

    // Prevent booking a time that has already passed today
    if (bookingDate === todayDate) {
        const currentMinutes =
            pakistanNow.getHours() * 60 +
            pakistanNow.getMinutes();

        if (startMinutes <= currentMinutes) {
            throw new Error(
                "Cannot create a booking for a past time"
            );
        }
    }

    // Check whether the booking fits inside business hours
    const fitsInsideAvailability =
        availabilityResult.rows.some(
            (availability) => {
                const [
                    availabilityStartHour,
                    availabilityStartMinute
                ] = availability.start_time
                    .split(":")
                    .map(Number);

                const [
                    availabilityEndHour,
                    availabilityEndMinute
                ] = availability.end_time
                    .split(":")
                    .map(Number);

                const availabilityStartMinutes =
                    availabilityStartHour * 60 +
                    availabilityStartMinute;

                const availabilityEndMinutes =
                    availabilityEndHour * 60 +
                    availabilityEndMinute;

                return (
                    startMinutes >=
                        availabilityStartMinutes &&
                    endMinutes <=
                        availabilityEndMinutes
                );
            }
        );

    if (!fitsInsideAvailability) {
        throw new Error(
            "Booking time is outside business hours"
        );
    }

    // Check for overlapping bookings
    const conflictResult = await pool.query(
        `SELECT id
         FROM bookings
         WHERE service_id = $1
           AND booking_date = $2
           AND status IN ('PENDING', 'CONFIRMED')
           AND start_time < $3
           AND end_time > $4`,
        [
            serviceId,
            bookingDate,
            endTime,
            normalizedStartTime
        ]
    );

    if (conflictResult.rows.length > 0) {
        throw new Error(
            "This time slot is already booked"
        );
    }

    // Create the booking
    const result = await pool.query(
        `INSERT INTO bookings
            (
                customer_id,
                service_id,
                booking_date,
                start_time,
                end_time,
                status
            )
         VALUES
            ($1, $2, $3, $4, $5, 'PENDING')
         RETURNING
            id,
            customer_id,
            service_id,
            booking_date,
            start_time,
            end_time,
            status,
            created_at`,
        [
            customerId,
            serviceId,
            bookingDate,
            normalizedStartTime,
            endTime
        ]
    );

    return result.rows[0];
}


// =========================================================
// GET CUSTOMER BOOKINGS
// =========================================================

export async function getMyBookings(
    customerId: string
) {
    const result = await pool.query(
        `SELECT
            b.id,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.status,
            b.created_at,
            s.id AS service_id,
            s.name AS service_name,
            s.duration,
            s.price,
            bus.id AS business_id,
            bus.name AS business_name
         FROM bookings b
         JOIN services s
            ON b.service_id = s.id
         JOIN businesses bus
            ON s.business_id = bus.id
         WHERE b.customer_id = $1
         ORDER BY
            b.booking_date ASC,
            b.start_time ASC`,
        [customerId]
    );

    return result.rows;
}


// =========================================================
// CUSTOMER CANCEL BOOKING
// =========================================================

export async function cancelBooking(
    bookingId: string,
    customerId: string
) {
    const result = await pool.query(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE id = $1
           AND customer_id = $2
           AND status IN ('PENDING', 'CONFIRMED')
         RETURNING
            id,
            customer_id,
            service_id,
            booking_date,
            start_time,
            end_time,
            status,
            created_at`,
        [
            bookingId,
            customerId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Booking not found, access denied, or booking cannot be cancelled"
        );
    }

    return result.rows[0];
}


// =========================================================
// GET BUSINESS BOOKINGS
// =========================================================

export async function getBusinessBookings(
    businessId: string,
    ownerId: string
) {
    // Verify that the logged-in owner owns this business
    const ownershipResult = await pool.query(
        `SELECT id
         FROM businesses
         WHERE id = $1
           AND owner_id = $2`,
        [
            businessId,
            ownerId
        ]
    );

    if (ownershipResult.rows.length === 0) {
        throw new Error(
            "Business not found or access denied"
        );
    }

    const result = await pool.query(
        `SELECT
            b.id,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.status,
            b.created_at,

            u.id AS customer_id,
            u.name AS customer_name,
            u.email AS customer_email,

            s.id AS service_id,
            s.name AS service_name,
            s.duration,
            s.price

         FROM bookings b

         JOIN users u
            ON b.customer_id = u.id

         JOIN services s
            ON b.service_id = s.id

         WHERE s.business_id = $1

         ORDER BY
            b.booking_date ASC,
            b.start_time ASC`,
        [businessId]
    );

    return result.rows;
}


// =========================================================
// GET AVAILABLE SLOTS
// =========================================================

export async function getAvailableSlots(
    serviceId: string,
    bookingDate: string
) {
    // Get service information
    const serviceResult = await pool.query(
        `SELECT
            id,
            business_id,
            duration
         FROM services
         WHERE id = $1`,
        [serviceId]
    );

    if (serviceResult.rows.length === 0) {
        throw new Error("Service not found");
    }

    const service = serviceResult.rows[0];

    // Validate booking date
    const bookingDateObject = new Date(
        `${bookingDate}T00:00:00`
    );

    if (Number.isNaN(bookingDateObject.getTime())) {
        throw new Error("Invalid booking date");
    }

    // Get day of week
    const dayOfWeek =
        bookingDateObject.getDay();

    // Get business availability
    const availabilityResult = await pool.query(
        `SELECT
            start_time,
            end_time
         FROM availability
         WHERE business_id = $1
           AND day_of_week = $2
         ORDER BY start_time ASC`,
        [
            service.business_id,
            dayOfWeek
        ]
    );

    if (availabilityResult.rows.length === 0) {
        throw new Error(
            "Business is closed on this day"
        );
    }

    // Get existing bookings
    const bookingsResult = await pool.query(
        `SELECT
            start_time,
            end_time
         FROM bookings
         WHERE service_id = $1
           AND booking_date = $2
           AND status IN ('PENDING', 'CONFIRMED')
         ORDER BY start_time ASC`,
        [
            serviceId,
            bookingDate
        ]
    );

    const availableSlots: string[] = [];

    // Generate slots for each availability period
    for (
        const availability of
        availabilityResult.rows
    ) {
        const [
            startHour,
            startMinute
        ] = availability.start_time
            .split(":")
            .map(Number);

        const [
            endHour,
            endMinute
        ] = availability.end_time
            .split(":")
            .map(Number);

        const availabilityStart =
            startHour * 60 +
            startMinute;

        const availabilityEnd =
            endHour * 60 +
            endMinute;

        for (
            let slotStart =
                availabilityStart;

            slotStart + service.duration <=
                availabilityEnd;

            slotStart += service.duration
        ) {
            const slotEnd =
                slotStart +
                service.duration;

            const slotStartTime =
                `${String(
                    Math.floor(slotStart / 60)
                ).padStart(2, "0")}:${String(
                    slotStart % 60
                ).padStart(2, "0")}`;

            const slotEndTime =
                `${String(
                    Math.floor(slotEnd / 60)
                ).padStart(2, "0")}:${String(
                    slotEnd % 60
                ).padStart(2, "0")}`;

            // Check whether this slot overlaps
            // an existing booking
            const isBooked =
                bookingsResult.rows.some(
                    (booking) =>
                        slotStartTime <
                            booking.end_time &&
                        slotEndTime >
                            booking.start_time
                );

            if (!isBooked) {
                availableSlots.push(
                    slotStartTime
                );
            }
        }
    }

    return availableSlots;
}


// =========================================================
// UPDATE BOOKING STATUS
// PENDING → CONFIRMED
// CONFIRMED → COMPLETED
// =========================================================

export async function updateBookingStatus(
    bookingId: string,
    businessId: string,
    ownerId: string,
    status: "CONFIRMED" | "COMPLETED"
) {
    // Verify that the owner owns this business
    const ownershipResult = await pool.query(
        `SELECT id
         FROM businesses
         WHERE id = $1
           AND owner_id = $2`,
        [
            businessId,
            ownerId
        ]
    );

    if (ownershipResult.rows.length === 0) {
        throw new Error(
            "Business not found or access denied"
        );
    }

    // Get the current booking status
    const bookingResult = await pool.query(
        `SELECT
            b.id,
            b.status
         FROM bookings b
         JOIN services s
            ON b.service_id = s.id
         WHERE b.id = $1
           AND s.business_id = $2`,
        [
            bookingId,
            businessId
        ]
    );

    if (bookingResult.rows.length === 0) {
        throw new Error(
            "Booking not found or access denied"
        );
    }

    const currentStatus =
        bookingResult.rows[0].status;

    // PENDING → CONFIRMED
    if (
        status === "CONFIRMED" &&
        currentStatus !== "PENDING"
    ) {
        throw new Error(
            "Only pending bookings can be confirmed"
        );
    }

    // CONFIRMED → COMPLETED
    if (
        status === "COMPLETED" &&
        currentStatus !== "CONFIRMED"
    ) {
        throw new Error(
            "Only confirmed bookings can be marked as completed"
        );
    }

    // Perform the status update
    const result = await pool.query(
        `UPDATE bookings
         SET status = $1
         WHERE id = $2
           AND status = $3
         RETURNING
            id,
            customer_id,
            service_id,
            booking_date,
            start_time,
            end_time,
            status,
            created_at`,
        [
            status,
            bookingId,
            currentStatus
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Booking could not be updated"
        );
    }

    return result.rows[0];
}