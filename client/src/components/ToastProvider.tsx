import { useState, useCallback, useRef, useEffect } from "react";
import {
  ToastContext,
  type ToastType,
  type ToastVariant,
} from "../context/ToastContext";
import { ToastItem } from "./ui/ToastItem";

const TOAST_DURATION = 3000;
const EXIT_DURATION = 300; // must match ToastItem transition duration-300
const MAX_TOASTS = 5;

type InternalToast = ToastType & { exiting?: boolean }; // id, message, type, exiting

interface Timer {
  timeoutId: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, Timer>>(new Map());
  const exitTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const toastsRef = useRef<InternalToast[]>([]);

  const syncToasts = (next: InternalToast[]) => {
    toastsRef.current = next;
    setToasts(next);
  };

  const removeToast = useCallback((id: number) => {
    const toast = toastsRef.current.find((t) => t.id === id);

    if (!toast || toast.exiting) {
      return;
    }

    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer.timeoutId);
      timers.current.delete(id);
    }

    syncToasts(
      toastsRef.current.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );

    const exitTimeoutId = setTimeout(() => {
      syncToasts(toastsRef.current.filter((t) => t.id !== id));
      exitTimers.current.delete(id);
    }, EXIT_DURATION);

    exitTimers.current.set(id, exitTimeoutId);
  }, []);

  const startTimer = useCallback(
    (id: number, duration: number) => {
      const timeoutId = setTimeout(() => removeToast(id), duration);

      timers.current.set(id, {
        timeoutId,
        remaining: duration,
        startedAt: Date.now(),
      });
    },
    [removeToast],
  );

  const pauseToast = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (!timer) {
      return;
    }

    clearTimeout(timer.timeoutId);

    // Does not reset remaining time instead continues from where it left off
    timer.remaining = Math.max(
      timer.remaining - (Date.now() - timer.startedAt),
      0,
    );
  }, []);

  const resumeToast = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);

      if (!timer) {
        return;
      }

      timer.startedAt = Date.now();
      timer.timeoutId = setTimeout(() => removeToast(id), timer.remaining);
    },
    [removeToast],
  );

  const showToast = useCallback(
    (message: string, type: ToastVariant = "default") => {
      const id = idRef.current++;
      const next = [...toastsRef.current, { id, message, type }];

      syncToasts(next);
      startTimer(id, TOAST_DURATION);

      const activeCount = next.filter((t) => !t.exiting).length;

      if (activeCount > MAX_TOASTS) {
        const oldest = next.find((t) => !t.exiting);

        if (oldest) {
          removeToast(oldest.id);
        }
      }
    },
    [startTimer, removeToast],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer.timeoutId));
      timers.current.clear();
      exitTimers.current.forEach((timeoutId) => clearTimeout(timeoutId));
      exitTimers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}

      <div
        className="fixed bottom-6 right-6 z-100 flex flex-col gap-2 items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            message={t.message}
            type={t.type}
            exiting={t.exiting}
            onDismiss={() => removeToast(t.id)}
            onMouseEnter={() => pauseToast(t.id)}
            onMouseLeave={() => resumeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
