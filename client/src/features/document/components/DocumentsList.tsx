import { DocumentRow } from "./ui/DocumentRow";
import type { Document } from "../document.types";
import { Button } from "../../../components/ui/Button";

interface DocumentsListProps {
  documents: Document[];
  onCreateClick?: () => void;
  emptyMessage?: string;
}

export function DocumentsList({
  documents,
  onCreateClick,
  emptyMessage,
}: DocumentsListProps) {
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
        <div className="card p-0 shadow-[6px_6px_0_#000] overflow-hidden">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr className="border-b-2 border-black bg-black text-white">
                <th className="py-2 px-4 text-left font-bold uppercase tracking-widest">
                  Name
                </th>

                <th className="py-2 px-4 text-left font-bold uppercase tracking-widest hidden sm:table-cell">
                  Owner
                </th>

                <th className="py-2 px-4 text-left font-bold uppercase tracking-widest hidden md:table-cell">
                  Collaborators
                </th>

                <th className="py-2 px-4 text-right font-bold uppercase tracking-widest hidden sm:table-cell">
                  Last Edited
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {documents.map((document) => (
                <DocumentRow key={document.id} document={document} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
