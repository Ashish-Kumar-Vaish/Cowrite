import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../document.service";
import type { Document } from "../../document.types";
import { Lock, Globe, Trash2 } from "lucide-react";
import { ErrorMessage } from "../../../../components/ui/ErrorMessage";
import { cn } from "../../../../utils/cn";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { Button } from "../../../../components/ui/Button";
import { ConfirmModal } from "../../../../components/ui/ConfirmModal";

interface SettingsTabProps {
  document: Document;
  onUpdate: (doc: Document) => void;
}

export function SettingsTab({ document, onUpdate }: SettingsTabProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleVisibility = async () => {
    try {
      const updated = await documentService.updateVisibility(
        document.id,
        !document.isPublic,
      );

      onUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update visibility"));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await documentService.deleteDocument(document.id);

      navigate("/documents");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete document"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}

      {/* Visibility */}
      <div className="flex items-start justify-between py-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 basis-0 badge",
              document.isPublic
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black",
            )}
          >
            {document.isPublic ? (
              <Globe size={18} strokeWidth={2.5} />
            ) : (
              <Lock size={18} strokeWidth={2.5} />
            )}
          </div>

          <div>
            <p className="font-black text-sm">
              {document.isPublic ? "Public" : "Private"}
            </p>

            <p className="text-xs font-medium text-black/40">
              {document.isPublic
                ? "Anyone can view this document"
                : "Only you and collaborators can access this document"}
            </p>
          </div>
        </div>

        <Button
          className="shrink-0 btn-secondary ml-4"
          onClick={handleToggleVisibility}
        >
          {document.isPublic ? "Make Private" : "Make Public"}
        </Button>
      </div>

      {/* Delete */}
      <div className="flex items-start justify-between py-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 basis-0 badge bg-red-500 text-white">
            <Trash2 size={18} strokeWidth={2.5} />
          </div>

          <div>
            <p className="font-black text-sm text-red-500">Delete Document</p>

            <p className="text-xs font-medium text-black/40">
              This action cannot be undone
            </p>
          </div>
        </div>

        <Button className="btn-red ml-4" onClick={() => setShowConfirm(true)}>
          Delete
        </Button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete Document?"
          message="This action cannot be undone. The document and all its content will be permanently deleted."
          confirmLabel="Yes, Delete"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
