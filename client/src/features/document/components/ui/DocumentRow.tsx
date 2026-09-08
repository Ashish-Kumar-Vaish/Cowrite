import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/formatDate";
import type { Document } from "../../document.types";
import { Avatar } from "../../../../components/ui/Avatar";
import { FileText } from "lucide-react";

interface DocumentRowProps {
  document: Document;
}

export function DocumentRow({ document }: DocumentRowProps) {
  const navigate = useNavigate();

  return (
    <tr
      className="border-b-2 border-black cursor-pointer hover:bg-yellow-100 
      transition-all duration-100"
      onClick={() => navigate(`/document/${document.id}`)}
    >
      {/* Title */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <FileText size={24} className="hidden sm:block" />

          <Avatar
            name={document.owner.name}
            avatar={document.owner.avatar}
            className="sm:hidden w-8 h-8"
          />

          <div>
            <div className="flex items-center gap-3">
              <span className="font-bold truncate max-w-xs">
                {document.title || "Untitled"}
              </span>

              {document.isPublic && (
                <span className="badge text-xs shrink-0">Public</span>
              )}
            </div>

            <span className="sm:hidden text-xs text-gray-400 font-medium">
              {formatDate(document.updatedAt)}
            </span>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="py-3 px-4 hidden sm:table-cell">
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
      </td>

      {/* Collaborators */}
      <td className="py-3 px-4 hidden md:table-cell">
        {document.collaborators.length > 0 ? (
          <div className="flex items-center">
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
        ) : (
          <span className="text-sm text-gray-400 font-medium">Only you</span>
        )}
      </td>

      {/* Last edited */}
      <td className="py-3 px-4 text-right hidden sm:table-cell">
        <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
          {formatDate(document.updatedAt)}
        </span>
      </td>
    </tr>
  );
}
