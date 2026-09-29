export interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  created_at: string;
  service_id: string;
  service_name: string;
  duration: number;
  price: string;
  business_id: string;
  business_name: string;
}
export interface MyBookingsResponse {
  bookings: Booking[];
}
