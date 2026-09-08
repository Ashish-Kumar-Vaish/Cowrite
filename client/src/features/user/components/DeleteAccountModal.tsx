import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { Spinner } from "../../../components/ui/Spinner";

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountModal({
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const confirmed = input === "delete";

  const handleConfirm = async () => {
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await onConfirm();
    } catch (err) {
      setServerError(getErrorMessage(err, "Account deletion failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-red-500">
            <Trash2 size={24} />
            Delete Account
          </div>

          <Button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 rounded p-3 flex flex-col gap-1">
          <p className="text-sm font-bold text-red-700">
            This cannot be undone.
          </p>

          <p className="text-sm text-red-600">
            All your documents, collaborations, and data will be permanently
            deleted.
          </p>
        </div>

        {/* Confirm input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-500">
            Type <span className="text-black font-mono">'delete'</span> to
            confirm
          </label>

          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onClear={() => setInput("")}
            placeholder="delete"
            autoComplete="off"
          />
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
            className="btn-red"
            onClick={handleConfirm}
            disabled={!confirmed || loading}
          >
            {loading && <Spinner />}
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  );
}
