import { httpClient } from "../../lib/httpClient";
import type { AuthUser } from "../../types/user";
import type { LoginCredentials, RegisterCredentials } from "./auth.types";

export const getMe = () => {
  return httpClient.get<AuthUser>("/api/auth/me");
};

export const login = (data: LoginCredentials) => {
  return httpClient.post<{ token: string }>("/api/auth/login", data);
};

export const register = (data: RegisterCredentials) => {
  return httpClient.post<{ token: string }>("/api/auth/register", data);
};

export const logout = () => {
  return httpClient.post<void>("/api/auth/logout");
};
