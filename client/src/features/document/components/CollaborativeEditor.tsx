import { useEffect, useRef } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { MessageSquare } from "lucide-react";
import {
  Editor,
  EditorToolbar,
  useCollaboration,
  useDocumentEditor,
} from "../../editor";
import { CommentHoverCard, type Comment } from "../../comment";
import type { Editor as TiptapEditor } from "@tiptap/core";
import type { Document } from "../document.types";
import { BrutalButton } from "../../../components/ui/BrutalButton";

export interface AwarenessUser {
  id: string;
  name: string;
  avatar?: string | null;
  isAnonymous: boolean;
  color: string;
}

interface CollaborativeEditorProps {
  document: Document;
  canSave: boolean;
  canComment: boolean;
  isAnonymous: boolean;
  zoom: number;
  comments: Comment[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onAwarenessChange: () => Promise<void>;
  onConnectedChange: (connected: boolean) => void;
  onSyncedChange: (synced: boolean) => void;
  onEditorReady: (editor: TiptapEditor | null) => void;
  onAwarenessUsers: (users: AwarenessUser[]) => void;
  onOpenComments: () => void;
}

export function CollaborativeEditor({
  document,
  canSave,
  canComment,
  isAnonymous,
  zoom,
  comments,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onAwarenessChange,
  onConnectedChange,
  onSyncedChange,
  onEditorReady,
  onAwarenessUsers,
  onOpenComments,
}: CollaborativeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const wsEnabled =
    canSave || (document.collaborators?.length ?? 0) > 0 || !!document.isPublic;

  const { ydoc, provider, connected, synced } = useCollaboration({
    documentId: document.id,
    enabled: wsEnabled,
    onAwarenessChange,
  });

  useEffect(() => {
    if (!provider?.awareness) {
      return;
    }

    const updateUsers = () => {
      const states = provider.awareness!.getStates();
      const uniqueUsers = new Map<string, AwarenessUser>();

      states.forEach((state) => {
        if (state.user?.id) {
          uniqueUsers.set(state.user.id, state.user);
        }
      });

      onAwarenessUsers(Array.from(uniqueUsers.values()));
    };

    provider.awareness.on("change", updateUsers);
    updateUsers();

    return () => {
      provider.awareness?.off("change", updateUsers);
    };
  }, [provider]);

  const editor = useDocumentEditor({
    ydoc,
    provider,
    editable: canSave,
    collaborative: true,
    showCursors: !isAnonymous,
  });

  useEffect(() => {
    onConnectedChange(connected);
  }, [connected]);

  useEffect(() => {
    onSyncedChange(synced);
  }, [synced]);

  useEffect(() => {
    onEditorReady(editor);
  }, [editor]);

  return (
    <>
      {canSave && (
        <EditorToolbar
          editor={editor}
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onZoomReset={onZoomReset}
        />
      )}

      {canComment && editor && (
        <BubbleMenu
          editor={editor}
          options={{
            offset: 6,
            placement: "top",
            flip: true,
            shift: { padding: 8 },
          }}
          shouldShow={({ state }) => !state.selection.empty}
        >
          <BrutalButton
            className="bg-yellow-300 text-black text-xs"
            onClick={onOpenComments}
          >
            <MessageSquare size={14} />
            Comment
          </BrutalButton>
        </BubbleMenu>
      )}

      <div
        id="editor-container"
        ref={containerRef}
        className="prose max-w-none"
      >
        <Editor editor={editor} zoom={zoom} />
      </div>

      <CommentHoverCard comments={comments} containerRef={containerRef} />
    </>
  );
}
