import { apiRequest } from "./api";

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  created_at?: string;
}

interface ServicesResponse {
  services: Service[];
}

// Get services belonging to businesses owned by the logged-in owner
export async function getMyServices(
  businessId: string
): Promise<Service[]> {
  const data = await apiRequest(
    `/services/my?businessId=${businessId}`
  );

  return (data as ServicesResponse).services;
}

// Get services for a specific business
// Used by customers when viewing a business and booking a service
export async function getBusinessServices(
  businessId: string
): Promise<Service[]> {
  const data = await apiRequest(
    `/services/business/${businessId}`
  );

  return (data as ServicesResponse).services;
}

// Create a new service
export async function createService(service: {
  businessId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}): Promise<Service> {
  const data = await apiRequest("/services", {
    method: "POST",
    body: JSON.stringify(service),
  });

  return (data as { service: Service }).service;
}

// Update an existing service
export async function updateService(
  id: string,
  service: {
    businessId: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }
): Promise<Service> {
  const data = await apiRequest(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(service),
  });

  return (data as { service: Service }).service;
}

// Delete a service
export async function deleteService(
  id: string
): Promise<void> {
  await apiRequest(`/services/${id}`, {
    method: "DELETE",
  });
}