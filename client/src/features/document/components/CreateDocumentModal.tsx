import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../document.service";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";

interface CreateDocumentModalProps {
  onClose: () => void;
}

export function CreateDocumentModal({ onClose }: CreateDocumentModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (creating) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const doc = await documentService.createDocument({
        title: title || "Untitled",
      });

      navigate(`/document/${doc.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create document"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card w-full max-w-md p-8">
        <h2 className="font-extrabold text-xl mb-4">New Document</h2>

        {error && <ErrorMessage message={error} />}

        <Input
          wrapperClassName="mb-4"
          placeholder="Document title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onClear={() => setTitle("")}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />

        <div className="btn-group justify-end">
          <Button className="btn-secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
