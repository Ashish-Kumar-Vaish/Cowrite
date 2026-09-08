import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import { useDocument } from "../hooks/useDocument";
import { Loading } from "../../../components/ui/Loading";
import { documentService } from "../document.service";
import { DocumentSettingsModal } from "../components/settings/DocumentSettingsModal";
import { ErrorPage } from "../../../components/ErrorPage";
import { useAuth } from "../../auth";
import { DocumentHeader } from "../components/DocumentHeader";
import { useDebouncedCallback } from "../../../hooks/useDebouncedCallback";
import { Button } from "../../../components/ui/Button";
import { VersionsSidebar } from "../../version";
import { CommentsSidebar, useComments } from "../../comment";
import {
  CollaborativeEditor,
  type AwarenessUser,
} from "../components/CollaborativeEditor";
import type { Editor as TiptapEditor } from "@tiptap/core";
import {
  clearPendingCommentRange,
  setPendingCommentRange,
} from "../../editor/extensions/PendingCommentHighlight";

export function DocumentPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);

  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { document, loading, error, errorStatus, setDocument, refetch } =
    useDocument(id ?? "");

  const {
    comments,
    setComments,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useComments(id ?? "");

  const isCollaborator =
    document?.collaborators?.some((c) => c.user.id === user?.id) ?? false;

  const collaboratorRole = document?.collaborators?.find(
    (c) => c.user.id === user?.id,
  )?.role;

  const isAnonymous = !user;
  const isOwner = document?.ownerId === user?.id;
  const isEditor = isCollaborator && collaboratorRole === "EDITOR";
  const isViewer = isCollaborator && collaboratorRole === "VIEWER";
  const canSave = !!(isOwner || isEditor);
  const canComment = !!(isOwner || isEditor || isViewer);

  const handleAwarenessChange = useCallback(async () => {
    await refetch();
  }, []);

  const handleTitleChange = (newTitle: string) => {
    if (!document || isAnonymous || isViewer) {
      return;
    }

    setDocument({ ...document, title: newTitle });
    debouncedSaveTitle(newTitle);
  };

  const debouncedSaveTitle = useDebouncedCallback(async (newTitle: string) => {
    if (!id) {
      return;
    }

    await documentService.updateDocumentTitle(id, { title: newTitle });
  }, 2000);

  const handleOpenComments = () => {
    if (editor && !editor.isDestroyed && !editor.state.selection.empty) {
      const { from, to } = editor.state.selection;
      setPendingCommentRange(editor, from, to);
    }

    setShowComments(true);
  };

  const handleCloseComments = () => {
    if (editor && !editor.isDestroyed) {
      clearPendingCommentRange(editor);
    }

    setShowComments(false);
  };

  if (!id) {
    return <ErrorPage message="Invalid document id" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    if (errorStatus === 403) {
      navigate(`/document/${id}/request-access`, { replace: true });
      return null;
    }

    return <ErrorPage message={error} />;
  }

  if (!document) {
    return <ErrorPage message="Document not found" />;
  }

  return (
    <div>
      <DocumentHeader
        document={document}
        connected={connected}
        synced={synced}
        canSave={canSave}
        isOwner={isOwner}
        isViewer={isViewer}
        isEditor={isEditor}
        isAnonymous={isAnonymous}
        onTitleChange={handleTitleChange}
        onSettingsOpen={() => setShowSettings(true)}
        onHistoryOpen={() => setShowVersions(true)}
        onCommentsOpen={handleOpenComments}
        awarenessUsers={awarenessUsers}
      />

      {!canSave && (
        <div
          className="flex items-center justify-between px-6 py-3 border-b-2 border-black 
          bg-white sticky top-[calc(var(--navbar-height)+var(--document-header-height))] z-10"
        >
          {user ? (
            <>
              <span className="text-sm font-black text-black/40">
                You don't have permission to edit this document
              </span>

              <Button
                className="btn-primary font-black text-sm"
                onClick={() => navigate(`/document/${id}/request-access`)}
              >
                Request Access
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-black text-black/40">
                Sign in to edit this document
              </span>

              <Button
                className="btn-primary font-black text-sm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      )}

      <CollaborativeEditor
        key={editorKey}
        document={document}
        canSave={canSave}
        canComment={canComment}
        isAnonymous={isAnonymous}
        zoom={zoom}
        comments={comments}
        onZoomIn={() => setZoom((z) => Math.min(200, z + 10))}
        onZoomOut={() => setZoom((z) => Math.max(50, z - 10))}
        onZoomReset={() => setZoom(100)}
        onAwarenessChange={handleAwarenessChange}
        onConnectedChange={setConnected}
        onSyncedChange={setSynced}
        onEditorReady={setEditor}
        onAwarenessUsers={setAwarenessUsers}
        onOpenComments={handleOpenComments}
      />

      {showSettings && document && (
        <DocumentSettingsModal
          document={document}
          onClose={() => setShowSettings(false)}
          onUpdate={setDocument}
          onRefetch={refetch}
        />
      )}

      {showVersions && (
        <VersionsSidebar
          documentId={id}
          isOwner={isOwner}
          onClose={() => setShowVersions(false)}
          onRestore={(version) => {
            setDocument((prev) =>
              prev ? { ...prev, title: version.title } : prev,
            );
            setShowVersions(false);
            setEditorKey((k) => k + 1);
          }}
        />
      )}

      {showComments && (
        <CommentsSidebar
          documentId={id}
          editor={editor}
          canComment={canComment}
          isOwner={isOwner}
          comments={comments}
          setComments={setComments}
          loading={commentsLoading}
          error={commentsError}
          refetch={refetchComments}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
}
