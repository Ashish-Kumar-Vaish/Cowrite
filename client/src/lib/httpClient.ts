import type { AxiosRequestConfig } from "axios";
import { api } from "./axios";

export const httpClient = {
  // Only returns data and not error responses
  // as errors are handled globally by the axios
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.get<T>(url, config);
    return res.data;
  },

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res = await api.post<T>(url, data, config);
    return res.data;
  },

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res = await api.put<T>(url, data, config);
    return res.data;
  },

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res = await api.patch<T>(url, data, config);
    return res.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.delete<T>(url, config);
    return res.data;
  },
};
