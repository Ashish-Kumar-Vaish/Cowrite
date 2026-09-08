import { getPublicProfile as apiGetPublicProfile,
  searchByEmail as apiSearchByEmail,
  updateProfile as apiUpdateProfile,
  updateAvatar as apiUpdateAvatar,
  updateEmail as apiUpdateEmail,
  updatePassword as apiUpdatePassword,
  deleteAccount as apiDeleteAccount,
  updateGeminiApiKey as apiUpdateGeminiApiKey,
 } from "./user.api";

export const userService = {
  async getPublicProfile(username: string) {
    return apiGetPublicProfile(username);
  },

  async searchByEmail(email: string) {
    return apiSearchByEmail(email);
  },

  async updateProfile(data: {
    name?: string;
    username?: string;
    bio?: string;
  }) {
    return apiUpdateProfile(data);
  },

  async updateAvatar(file: File) {
    return apiUpdateAvatar(file);
  },

  async updateEmail(data: { email: string; password: string }) {
    return apiUpdateEmail(data);
  },

  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    return apiUpdatePassword(data);
  },

  async deleteAccount() {
    return apiDeleteAccount();
  },

  async updateGeminiApiKey(apiKey: string | null) {
    return apiUpdateGeminiApiKey(apiKey);
  },
};
