import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import type { ToastType } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const VARIANTS: Record<
  ToastType["type"],
  { bg: string; text: string; icon: LucideIcon | null }
> = {
  default: { bg: "bg-white", text: "text-black", icon: null },
  success: { bg: "bg-lime-200", text: "text-black", icon: Check },
  error: { bg: "bg-red-400", text: "text-white", icon: X },
  warning: {
    bg: "bg-yellow-300",
    text: "text-black",
    icon: AlertTriangle,
  },
  info: { bg: "bg-blue-300", text: "text-black", icon: Info },
};

interface ToastItemProps extends Omit<ToastType, "id"> {
  exiting?: boolean;
  onDismiss: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ToastItem({
  message,
  type,
  exiting,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const { bg, text, icon: Icon } = VARIANTS[type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (exiting) {
      setVisible(false);
    }
  }, [exiting]);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // duration-300 here must match EXIT_DURATION in ToastProvider
      className={cn(
        `relative flex items-center gap-3 px-4 py-3 border-2 border-black shadow-[4px_4px_0_#000] 
        font-black text-sm transition-all duration-300 rounded`,
        !exiting && !visible && "opacity-0 translate-y-4",
        !exiting && visible && "opacity-100 translate-y-0",
        exiting && "opacity-0 -translate-y-4",
        bg,
        text,
      )}
    >
      {Icon && <Icon size={16} strokeWidth={3} />}
      <span className="flex-1">{message}</span>

      <div className="absolute -top-2 -right-3 z-10">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded border-2 border-black shadow-[4px_4px_0_#000]",
            bg,
            text,
          )}
        />

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="relative p-1.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
