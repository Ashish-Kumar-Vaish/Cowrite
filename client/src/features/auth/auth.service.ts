import {
  getMe as apiGetMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "./auth.api";
import { storage } from "../../lib/storage";
import type { AuthUser } from "../../types/user";
import type { LoginCredentials, RegisterCredentials } from "./auth.types";

export const authService = {
  async getMe(): Promise<AuthUser> {
    return apiGetMe();
  },

  async login(credentials: LoginCredentials): Promise<void> {
    const result = await apiLogin(credentials);
    storage.setToken(result.token);
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    const result = await apiRegister(credentials);
    storage.setToken(result.token);
  },

  async logout(): Promise<void> {
    try {
      await apiLogout();
    } finally {
      storage.removeToken();
    }
  },
};
