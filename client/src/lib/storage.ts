export const storage = {
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  removeToken() {
    localStorage.removeItem("token");
  },
};