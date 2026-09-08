import { createContext } from "react";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastType {
  id: number;
  message: string;
  type: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastType[];
  showToast: (message: string, type?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
