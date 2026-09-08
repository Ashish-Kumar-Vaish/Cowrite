import { httpClient } from "../../lib/httpClient";
import type { AuthUser, PublicUser } from "../../types/user";
import type { UserSearchResult } from "./user.types";

export const getPublicProfile = (username: string) => {
  return httpClient.get<PublicUser>(`/api/user/${username}`);
};

export const searchByEmail = (email: string) => {
  return httpClient.get<UserSearchResult>(
    `/api/user/search?email=${encodeURIComponent(email)}`,
  );
};

export const updateProfile = (data: {
  name?: string;
  username?: string;
  bio?: string;
}) => {
  return httpClient.put<AuthUser>("/api/user/me", data);
};

export const updateAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return httpClient.put<AuthUser>("/api/user/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateEmail = (data: { email: string; password: string }) => {
  return httpClient.put<AuthUser>("/api/user/me/email", data);
};

export const updatePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return httpClient.put("/api/user/me/password", data);
};

export const deleteAccount = () => {
  return httpClient.delete("/api/user/me");
};

export const updateGeminiApiKey = (apiKey: string | null) => {
  return httpClient.put<AuthUser>("/api/user/gemini-key", { apiKey });
};
