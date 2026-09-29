import { apiRequest } from "./api";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  created_at: string;
}

interface BusinessesResponse {
  businesses: Business[];
}

export async function getAllBusinesses(): Promise<Business[]> {
  const data = await apiRequest("/businesses");

  return (data as BusinessesResponse).businesses;
}

export async function getMyBusinesses(): Promise<Business[]> {
  const data = await apiRequest("/businesses/my");

  return (data as BusinessesResponse).businesses;
}

export async function createBusiness(business: {
  name: string;
  description: string;
  location: string;
  category: string;
}): Promise<Business> {
  const data = await apiRequest("/businesses", {
    method: "POST",
    body: JSON.stringify(business),
  });

  return (data as { business: Business }).business;
}

export async function updateBusiness(
  id: string,
  business: {
    name: string;
    description: string;
    location: string;
    category: string;
  }
): Promise<Business> {
  const data = await apiRequest(`/businesses/${id}`, {
    method: "PUT",
    body: JSON.stringify(business),
  });

  return (data as { business: Business }).business;
}

export async function deleteBusiness(id: string): Promise<void> {
  await apiRequest(`/businesses/${id}`, {
    method: "DELETE",
  });
}