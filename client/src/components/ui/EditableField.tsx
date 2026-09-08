import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { ErrorMessage } from "./ErrorMessage";
import { Textarea } from "./Textarea";
import { Input } from "./Input";
import { Button } from "./Button";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Spinner } from "./Spinner";

interface EditableFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
  onSave: (val: string) => Promise<void>;
  validate?: (val: string) => string | undefined;
}

export function EditableField({
  label,
  value,
  multiline = false,
  onSave,
  validate,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const validationError = validate?.(draft);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save field"));
    } finally {
      setLoading(false);
    }
  };

  // Reset draft on cancel
  const handleCancel = () => {
    setDraft(value);
    setError(undefined);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>

      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            {multiline ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
            ) : (
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onClear={() => setDraft("")}
                autoFocus
              />
            )}

            <Button
              className="btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <Spinner /> : <Check size={16} />}
            </Button>

            <Button className="btn-secondary" onClick={handleCancel}>
              <X size={16} />
            </Button>
          </div>

          {error && <ErrorMessage message={error} />}
        </div>
      ) : (
        <div
          className="flex items-start justify-between gap-2 group cursor-text"
          onClick={() => setEditing(true)}
        >
          <span className="text-sm text-gray-800 flex-1 whitespace-pre-wrap">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </span>

          <Pencil
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          />
        </div>
      )}
    </div>
  );
}
