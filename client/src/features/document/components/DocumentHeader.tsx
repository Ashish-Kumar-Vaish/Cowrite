import { useState, useRef } from "react";
import {
  Check,
  Download,
  Settings,
  FileText,
  FileType,
  X,
  MoreVertical,
  History,
  MessageSquare,
} from "lucide-react";
import type { Document } from "../document.types";
import type { AwarenessUser } from "../components/CollaborativeEditor";
import { Avatar } from "../../../components/ui/Avatar";
import { useToast } from "../../../hooks/useToast";
import { useEventListener } from "../../../hooks/useEventListener";
import { cn } from "../../../utils/cn";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import saveAs from "file-saver";
import { documentService } from "../document.service";

interface DocumentHeaderProps {
  document: Document;
  connected: boolean;
  synced: boolean;
  canSave: boolean;
  isOwner: boolean;
  isViewer: boolean;
  isEditor: boolean;
  isAnonymous: boolean;
  onTitleChange: (title: string) => void;
  onSettingsOpen: () => void;
  onHistoryOpen: () => void;
  onCommentsOpen: () => void;
  awarenessUsers: AwarenessUser[];
}

export function DocumentHeader({
  document,
  connected,
  synced,
  canSave,
  isOwner,
  isViewer,
  isEditor,
  isAnonymous,
  onTitleChange,
  onSettingsOpen,
  onHistoryOpen,
  onCommentsOpen,
  awarenessUsers,
}: DocumentHeaderProps) {
  const toast = useToast();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const canSeeVersions = isOwner || isEditor;
  const canSeeComments = isOwner || isEditor || isViewer;

  useEventListener("mousedown", (e) => {
    if (
      downloadRef.current &&
      !downloadRef.current.contains(e.target as Node)
    ) {
      setShowDownloadMenu(false);
    }

    if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
      setShowMobileMenu(false);
    }
  });

  const handleDownload = async (format: "docx" | "pdf") => {
    if (!synced) {
      toast("Document is still syncing. Please wait.", "error");
      return;
    }

    const title = document.title.trim() || "Untitled";

    try {
      const blob = await documentService.exportDocument(document.id, format);

      saveAs(blob, `${title}.${format}`);
    } catch (err) {
      toast(getErrorMessage(err, "Failed to download document"), "error");
    } finally {
      setShowDownloadMenu(false);
      setShowMobileMenu(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between px-2 sm:px-6 py-3 border-b-3 border-black 
      bg-white sticky top-(--navbar-height) z-20 h-(--document-header-height)"
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <div
          className={cn(
            "w-2.5 h-2.5 m-2 rounded-full border-2 border-black shrink-0",
            connected ? "bg-lime-400" : "bg-red-400",
          )}
        />

        <Input
          placeholder="Untitled"
          type="text"
          className="font-black text-xl truncate border-none focus:shadow-none"
          value={document.title ?? ""}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={!canSave}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Collaborators */}
        <div className="flex items-center">
          {awarenessUsers.slice(0, 4).map((u, i) => (
            <div
              key={u.id}
              className="relative"
              style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: 10 - i }}
              title={u.isAnonymous ? "Anonymous" : u.name}
            >
              <Avatar
                name={u.name}
                avatar={u.isAnonymous ? null : u.avatar}
                className="w-7 h-7 shadow-[2px_2px_0_#000]"
              />
            </div>
          ))}

          {awarenessUsers.length > 4 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-black bg-amber-50 flex items-center 
              justify-center text-xs font-black -ml-2"
            >
              +{awarenessUsers.length - 4}
            </div>
          )}
        </div>

        {/* Status */}
        {isViewer || isAnonymous ? (
          <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-black/30">
            View only
          </span>
        ) : !synced ? (
          <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-yellow-600">
            Saving...
          </span>
        ) : (
          <span
            className="hidden sm:flex items-center gap-1 text-xs font-black uppercase tracking-widest 
            text-lime-600"
          >
            <Check size={13} />
            Saved
          </span>
        )}

        {/* Desktop Toolbar */}
        <div className="hidden sm:flex items-center gap-2">
          {canSeeComments && (
            <Button className="btn-secondary" onClick={onCommentsOpen}>
              <MessageSquare size={18} />
            </Button>
          )}

          {canSeeVersions && (
            <Button className="btn-secondary" onClick={onHistoryOpen}>
              <History size={18} />
            </Button>
          )}

          <div className="relative" ref={downloadRef}>
            <Button
              className="btn-secondary"
              onClick={() => setShowDownloadMenu((v) => !v)}
            >
              <Download size={18} />
            </Button>

            {showDownloadMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 brutal-card bg-white overflow-hidden 
                flex flex-col min-w-40"
              >
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 
                  transition-colors border-b-2 border-black"
                  onClick={() => handleDownload("docx")}
                >
                  <FileText size={15} />
                  .docx
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 
                  transition-colors"
                  onClick={() => handleDownload("pdf")}
                >
                  <FileType size={15} />
                  .pdf
                </button>
              </div>
            )}
          </div>

          {isOwner && (
            <Button className="btn-secondary" onClick={onSettingsOpen}>
              <Settings size={18} />
            </Button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="relative sm:hidden" ref={mobileRef}>
          <button className="p-2" onClick={() => setShowMobileMenu((v) => !v)}>
            {showMobileMenu ? <X size={18} /> : <MoreVertical size={18} />}
          </button>

          {showMobileMenu && (
            <div
              className="absolute right-0 top-full mt-1 z-50 brutal-card 
              bg-white overflow-hidden flex flex-col min-w-48"
            >
              {canSeeComments && (
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-black 
                  hover:bg-amber-50 transition-colors border-b-2 border-black"
                  onClick={() => {
                    onCommentsOpen();
                    setShowMobileMenu(false);
                  }}
                >
                  <MessageSquare size={15} />
                  Comments
                </button>
              )}

              {canSeeVersions && (
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 transition-colors border-b-2 border-black"
                  onClick={() => {
                    onHistoryOpen();
                    setShowMobileMenu(false);
                  }}
                >
                  <History size={15} />
                  Version History
                </button>
              )}

              <button
                className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 transition-colors border-b-2 border-black"
                onClick={() => handleDownload("docx")}
              >
                <FileText size={15} />
                Download .docx
              </button>

              <button
                className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 transition-colors border-b-2 border-black"
                onClick={() => handleDownload("pdf")}
              >
                <FileType size={15} />
                Download .pdf
              </button>

              {isOwner && (
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-black hover:bg-amber-50 transition-colors"
                  onClick={() => {
                    onSettingsOpen();
                    setShowMobileMenu(false);
                  }}
                >
                  <Settings size={15} />
                  Settings
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
