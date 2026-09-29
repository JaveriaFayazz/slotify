import { apiRequest } from "./api";

export interface Availability {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityResponse {
  availability: Availability[];
}

// Get availability for an owner's business
export async function getMyAvailability(
  businessId: string
): Promise<Availability[]> {
  const data = await apiRequest(
    `/availability/my?businessId=${businessId}`
  );

  return (data as AvailabilityResponse).availability;
}

// Create availability
export async function createAvailability(data: {
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): Promise<Availability> {
  const response = await apiRequest("/availability", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return (response as { availability: Availability }).availability;
}

// Update availability
export async function updateAvailability(
  id: string,
  data: {
    businessId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }
): Promise<Availability> {
  const response = await apiRequest(`/availability/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return (response as { availability: Availability }).availability;
}

// Delete availability
export async function deleteAvailability(
  id: string,
  businessId: string
): Promise<void> {
  await apiRequest(`/availability/${id}`, {
    method: "DELETE",
    body: JSON.stringify({
      businessId,
    }),
  });
}