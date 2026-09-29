import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    createBooking,
    getMyBookings,
    cancelBooking,
    getBusinessBookings,
    getAvailableSlots,
    updateBookingStatus
} from "../services/booking.services";

export async function createBookingController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const {
            serviceId,
            bookingDate,
            startTime
        } = req.body;

        if (!serviceId || !bookingDate || !startTime) {
            return res.status(400).json({
                message: "Service ID, booking date, and start time are required"
            });
        }

        const booking = await createBooking({
            customerId: req.user.id,
            serviceId,
            bookingDate,
            startTime
        });

        return res.status(201).json({
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        console.error("Create booking error:", error);

        if (error instanceof Error) {
            if (error.message === "Service not found") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function getMyBookingsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const bookings = await getMyBookings(req.user.id);

        return res.status(200).json({
            bookings
        });
    } catch (error) {
        console.error("Get my bookings error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function cancelBookingController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const id = String(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Booking ID is required"
            });
        }

        const booking = await cancelBooking(
            id,
            req.user.id
        );

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        console.error("Cancel booking error:", error);

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function getBusinessBookingsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const businessId = String(req.params.businessId);

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        const bookings = await getBusinessBookings(
            businessId,
            req.user.id
        );

        return res.status(200).json({
            bookings
        });
    } catch (error) {
        console.error("Get business bookings error:", error);

        if (error instanceof Error) {
            if (error.message === "Business not found or access denied") {
                return res.status(403).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}
export async function getAvailableSlotsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const serviceId = String(req.query.serviceId || "");
        const bookingDate = String(req.query.bookingDate || "");

        if (!serviceId || !bookingDate) {
            return res.status(400).json({
                message: "Service ID and booking date are required"
            });
        }

        const slots = await getAvailableSlots(
            serviceId,
            bookingDate
        );

        return res.status(200).json({
            bookingDate,
            serviceId,
            slots
        });
    } catch (error) {
        console.error("Get available slots error:", error);

        if (error instanceof Error) {
            if (error.message === "Service not found") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function updateBookingStatusController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const bookingId = String(req.params.id);
        const businessId = String(req.body.businessId || "");
        const status = req.body.status;

        if (!bookingId || !businessId || !status) {
            return res.status(400).json({
                message: "Booking ID, business ID, and status are required"
            });
        }

        if (status !== "CONFIRMED" && status !== "COMPLETED") {
            return res.status(400).json({
                message: "Status must be CONFIRMED or COMPLETED"
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const booking = await updateBookingStatus(
            bookingId,
            businessId,
            req.user.id,
            status
        );

        return res.status(200).json({
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        console.error("Update booking status error:", error);

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}