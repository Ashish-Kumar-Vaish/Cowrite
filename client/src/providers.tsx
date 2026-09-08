import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "./features/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
