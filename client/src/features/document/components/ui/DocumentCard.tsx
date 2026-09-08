import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/formatDate";
import type { Document } from "../../document.types";
import { Avatar } from "../../../../components/ui/Avatar";
import { FileText } from "lucide-react";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="card cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0_#000] 
      transition-all duration-100 hover:bg-yellow-100"
      onClick={() => navigate(`/document/${document.id}`)}
    >
      <div className="flex justify-between mb-3 gap-3">
        <div className="flex items-center gap-2 truncate">
          <FileText size={24} className="shrink-0" />

          <span className="card-title truncate">
            {document.title || "Untitled"}
          </span>
        </div>

        {document.isPublic && (
          <span className="badge text-xs shrink-0">Public</span>
        )}
      </div>

      <p className="text-xs text-gray-400 font-medium mb-3">
        {formatDate(document.updatedAt)}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar
            name={document.owner.name}
            avatar={document.owner.avatar}
            className="w-8 h-8"
          />

          <span className="text-sm text-gray-600 font-medium">
            {document.owner.name}
          </span>
        </div>

        {document.collaborators.length > 0 && (
          <div className="flex ml-auto items-center">
            {document.collaborators.slice(0, 4).map((c) => (
              <Avatar
                key={c.user.id}
                name={c.user.name}
                avatar={c.user.avatar}
                className="w-8 h-8 -ml-4 first:ml-0 ring-2 ring-white"
              />
            ))}

            {document.collaborators.length > 4 && (
              <span className="text-sm font-bold ml-2 text-gray-500">
                +{document.collaborators.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
