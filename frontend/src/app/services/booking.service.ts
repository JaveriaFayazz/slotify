import { apiRequest } from "./api";

export interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;

  service_id: string;
  service_name?: string;
  duration?: number;
  price?: number;

  business_id?: string;
  business_name?: string;

  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface MyBookingsResponse {
  bookings: Booking[];
}

interface AvailableSlotsResponse {
  bookingDate: string;
  serviceId: string;
  slots: string[];
}

// Get customer's bookings
export async function getMyBookings(): Promise<MyBookingsResponse> {
  return apiRequest("/bookings/my");
}

// Get available time slots for a service on a specific date
export async function getAvailableSlots(
  serviceId: string,
  bookingDate: string
): Promise<string[]> {
  const data = await apiRequest(
    `/bookings/available?serviceId=${serviceId}&bookingDate=${bookingDate}`
  );

  return (data as AvailableSlotsResponse).slots;
}

// Create a new booking
export async function createBooking(
  serviceId: string,
  bookingDate: string,
  startTime: string
): Promise<Booking> {
  const data = await apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify({
      serviceId,
      bookingDate,
      startTime,
    }),
  });

  return (data as { booking: Booking }).booking;
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string
): Promise<Booking> {
  const data = await apiRequest(
    `/bookings/${bookingId}/cancel`,
    {
      method: "PUT",
    }
  );

  return (data as { booking: Booking }).booking;
}

// Get bookings for an owner's business
export async function getBusinessBookings(
  businessId: string
): Promise<Booking[]> {
  const data = await apiRequest(
    `/bookings/business/${businessId}`
  );

  return (data as { bookings: Booking[] }).bookings;
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string,
  businessId: string,
  status: "CONFIRMED" | "COMPLETED"
): Promise<Booking> {
  const data = await apiRequest(
    `/bookings/${bookingId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        businessId,
        status,
      }),
    }
  );

  return (data as { booking: Booking }).booking;
}