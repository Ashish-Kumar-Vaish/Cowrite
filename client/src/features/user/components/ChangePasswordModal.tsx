import { useState } from "react";
import { X, KeyRound } from "lucide-react";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { Button } from "../../../components/ui/Button";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { Spinner } from "../../../components/ui/Spinner";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSubmit: (current: string, next: string) => Promise<void>;
}

export function ChangePasswordModal({
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: typeof errors = {};

    if (!current) {
      e.current = "Required";
    }

    if (next.length < 8) {
      e.next = "Must be at least 8 characters";
    }

    if (next !== confirm) {
      e.confirm = "Passwords don't match";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await onSubmit(current, next);
      onClose();
    } catch (err) {
      setServerError(getErrorMessage(err, "Password change failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <KeyRound size={24} />
            Change Password
          </div>

          <Button className="btn-secondary" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Current Password</label>

          <PasswordInput
            placeholder="Enter your current password..."
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {errors.current && <ErrorMessage message={errors.current} />}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">New Password</label>

          <PasswordInput
            placeholder="Enter your new password..."
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          {errors.next && <ErrorMessage message={errors.next} />}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Confirm New Password</label>

          <PasswordInput
            placeholder="Confirm your new password..."
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          {errors.confirm && <ErrorMessage message={errors.confirm} />}
        </div>

        {serverError && <ErrorMessage message={serverError} />}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Spinner />}
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}
