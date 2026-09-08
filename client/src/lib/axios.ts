import axios, { AxiosError } from "axios";
import { storage } from "./storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use((config) => {
  const token = storage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const message =
        error.response.data?.message ?? `API Error: ${error.response.status}`;

      if (error.response.status === 401) {
        // Remove the token when authentication is no longer valid
        storage.removeToken();
      }

      const err = new Error(message) as Error & { status: number };
      err.status = error.response.status;

      return Promise.reject(err);
    }

    return Promise.reject(new Error("Network error"));
  },
);
