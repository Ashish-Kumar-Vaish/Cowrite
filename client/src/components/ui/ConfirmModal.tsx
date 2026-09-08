import { Trash2, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { ErrorMessage } from "./ErrorMessage";
import { Spinner } from "./Spinner";

type ConfirmVariant = "danger" | "warning" | "default";

const VARIANTS: Record<
  ConfirmVariant,
  { icon: LucideIcon; iconBg: string; btnClass: string }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-500 text-white",
    btnClass: "btn-red",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-300 text-black",
    btnClass: "btn-primary",
  },
  default: {
    icon: Info,
    iconBg: "bg-gray-200 text-black",
    btnClass: "btn-primary",
  },
};

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  error = null,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const { icon: Icon, iconBg, btnClass } = VARIANTS[variant];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="card w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 badge", iconBg)}>
            <Icon size={18} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-extrabold text-lg leading-tight">{title}</h3>

            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex gap-3 justify-end">
          <Button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button className={btnClass} onClick={onConfirm} disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
