import type { Document } from "../document.types";
import { Button } from "../../../components/ui/Button";
import { DocumentCard } from "./ui/DocumentCard";

interface DocumentsGridProps {
  documents: Document[];
  onCreateClick?: () => void;
  emptyMessage?: string;
}

export function DocumentsGrid({
  documents,
  onCreateClick,
  emptyMessage,
}: DocumentsGridProps) {
  return (
    <>
      {documents.length === 0 ? (
        <div className="card text-center py-10 shadow-none border-dashed">
          <p className="font-bold text-gray-400 mb-3">
            {emptyMessage ?? "No documents yet"}
          </p>

          {onCreateClick && (
            <Button className="btn-primary" onClick={onCreateClick}>
              Create your first document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </>
  );
}
