import { apiRequest } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "OWNER";
  created_at?: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: "CUSTOMER" | "OWNER"
): Promise<AuthResponse> {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}