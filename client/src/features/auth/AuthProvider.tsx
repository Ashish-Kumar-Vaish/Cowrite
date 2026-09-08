import { createContext, useCallback, useEffect, useState } from "react";
import type { AuthUser } from "../../types/user";
import { authService } from "./auth.service";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "./auth.types";
import { storage } from "../../lib/storage";
import { logger } from "../../lib/logger";

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = storage.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      setUser(data);
    } catch (err) {
      logger.error("Failed to fetch user:", err);
      setUser(null);

      const status = (err as Error & { status?: number }).status;

      if (status === 401) {
        storage.removeToken();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
    await fetchUser();
  };

  const login = async (credentials: LoginCredentials) => {
    await authService.login(credentials);
    await fetchUser();
  };

  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        updateUser,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
