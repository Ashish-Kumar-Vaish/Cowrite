import { useState } from "react";
import {
  X,
  Check,
  Trash2,
  Reply,
  MessageSquare,
  CornerDownRight,
  CheckCheckIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { commentService } from "../comment.service";
import { Avatar } from "../../../components/ui/Avatar";
import { Loading } from "../../../components/ui/Loading";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { Textarea } from "../../../components/ui/Textarea";
import { useAuth } from "../../auth";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { Comment } from "../comment.types";
import { ExpandableText } from "../../../components/ui/ExpandableText";
import { clearPendingCommentRange } from "../../editor/extensions/PendingCommentHighlight";

interface CommentsSidebarProps {
  documentId: string;
  editor: Editor | null;
  canComment: boolean;
  isOwner: boolean;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  onClose: () => void;
}

export function CommentsSidebar({
  documentId,
  editor,
  canComment,
  isOwner,
  comments,
  setComments,
  loading,
  error,
  refetch,
  onClose,
}: CommentsSidebarProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !editor || editor.isDestroyed) {
      return;
    }

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    setSubmitting(true);
    setActionError(null);

    try {
      const data = {
        content: newComment,
        parentId: null,
        selectedText: selectedText || null,
        fromPos: selectedText ? from : null,
        toPos: selectedText ? to : null,
      };

      const comment = await commentService.createComment(documentId, data);

      // Apply comment mark to selected text
      if (selectedText) {
        editor
          .chain()
          .focus()
          .setMark("comment", { commentId: comment.id })
          .run();
      }

      clearPendingCommentRange(editor);
      setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
      setNewComment("");
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to add comment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplying = async (parentId: string) => {
    if (!replyContent.trim()) {
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const data = {
        content: replyContent,
        parentId,
      };

      const reply = await commentService.createComment(documentId, data);

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c,
        ),
      );

      setReplyTo(null);
      setReplyContent("");
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to add reply"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      const updated = await commentService.resolveComment(commentId);

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, resolved: updated.resolved } : c,
        ),
      );
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to resolve comment"));
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);

      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r) => r.id !== commentId),
          })),
      );
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete comment"));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-screen w-85 bg-amber-50 border-2 
        border-black z-50 flex flex-col"
      >
        {/* Comments sidebar header */}
        <div
          className="border-b-3 border-black px-6 py-3 bg-black 
          flex items-center justify-between shrink-0"
        >
          <p className="text-xs font-black uppercase tracking-widest text-white">
            Comments
          </p>

          <button
            className="text-white/50 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto">
          {canComment && (
            <div
              className="border-b-2 border-black px-4 py-4 bg-white
              flex flex-col gap-2"
            >
              <p className="text-xs font-black uppercase tracking-widest text-black/40">
                {!editor || editor.state.selection.empty
                  ? "Add Comment"
                  : "Selected:"}
              </p>

              {editor && !editor.state.selection.empty && (
                <ExpandableText
                  text={editor?.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to,
                  )}
                  maxLength={150}
                  className="text-xs font-medium text-black/40 border-l-2 
                  border-yellow-400 pl-2 italic"
                />
              )}

              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                className="shrink-0"
                onChange={(e) => setNewComment(e.target.value)}
              />

              <Button
                className="btn-primary text-sm"
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
              >
                <MessageSquare size={14} />
                {submitting ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          )}

          <div>
            {loading && <Loading />}

            {(error || actionError) && (
              <div className="p-6 flex flex-col gap-3">
                <ErrorMessage message={error ?? actionError ?? ""} />

                {error && (
                  <Button className="btn-secondary text-sm" onClick={refetch}>
                    Retry
                  </Button>
                )}
              </div>
            )}

            {!loading && comments.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12">
                <MessageSquare size={20} className="text-black/20" />

                <p className="text-sm font-medium text-black/30 italic">
                  No comments yet
                </p>
              </div>
            )}

            {!loading && (
              <div className="flex flex-col divide-y-2 divide-black/10">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "px-4 py-4 flex flex-col gap-3",
                      comment.resolved && "opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar
                        name={comment.author.name}
                        avatar={comment.author.avatar}
                        className="w-6 h-6 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black leading-tight">
                            {comment.author.name}
                          </p>

                          <p className="text-xs text-black/30">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {comment.selectedText && (
                          <ExpandableText
                            text={comment.selectedText}
                            maxLength={150}
                            className="text-xs font-medium text-black/40 border-l-2 
                            border-yellow-400 pl-2 my-1 italic"
                          />
                        )}

                        <ExpandableText
                          text={comment.content}
                          maxLength={150}
                          className="text-sm font-medium text-black"
                        />
                      </div>
                    </div>

                    {/* Comment actions */}
                    <div className="flex items-center gap-2">
                      {canComment && (
                        <button
                          className="flex items-center gap-1 text-xs font-black 
                          text-black/40 hover:text-black transition-colors"
                          onClick={() =>
                            setReplyTo(
                              replyTo === comment.id ? null : comment.id,
                            )
                          }
                        >
                          <Reply size={12} />
                          Reply
                        </button>
                      )}

                      {isOwner && (
                        <button
                          className="flex items-center gap-1 text-xs font-black text-black/40 
                          hover:text-black transition-colors"
                          onClick={() => handleResolve(comment.id)}
                        >
                          {comment.resolved ? (
                            <>
                              <CheckCheckIcon size={12} />
                              Unresolve
                            </>
                          ) : (
                            <>
                              <Check size={12} />
                              Resolve
                            </>
                          )}
                        </button>
                      )}

                      {(user?.id === comment.author.id || isOwner) && (
                        <button
                          className="flex items-center gap-1 text-xs font-black 
                          text-black/40 hover:text-red-500 transition-colors ml-auto"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Reply to comment */}
                    {replyTo === comment.id && (
                      <div className="flex flex-col gap-2 pl-4 border-l-2 border-black/10">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />

                        <div className="flex gap-2">
                          <Button
                            className="btn-primary text-xs flex-1"
                            onClick={() => handleReplying(comment.id)}
                            disabled={submitting || !replyContent.trim()}
                          >
                            <CornerDownRight size={12} />
                            Reply
                          </Button>

                          <Button
                            className="btn-secondary text-xs"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent("");
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comment replies */}
                    {comment.replies.length > 0 && (
                      <>
                        <button
                          className="text-xs font-black text-black/40 hover:text-black 
                          transition-colors self-start"
                          onClick={() => toggleReplies(comment.id)}
                        >
                          {expandedReplies.has(comment.id) ? (
                            <div className="flex items-center gap-1">
                              <ChevronUp size={12} />

                              <span>Hide replies</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ChevronDown size={12} />

                              <span>
                                {`View ${comment.replies.length} ${
                                  comment.replies.length === 1
                                    ? "reply"
                                    : "replies"
                                }`}
                              </span>
                            </div>
                          )}
                        </button>

                        {expandedReplies.has(comment.id) && (
                          <div className="flex flex-col gap-3 pl-4 border-l-2 border-black/10">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="flex items-start gap-2"
                              >
                                <Avatar
                                  name={reply.author.name}
                                  avatar={reply.author.avatar}
                                  className="w-5 h-5 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-black">
                                      {reply.author.name}
                                    </p>

                                    <p className="text-xs text-black/30">
                                      {new Date(
                                        reply.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <ExpandableText
                                    text={reply.content}
                                    maxLength={150}
                                    className="text-sm font-medium text-black"
                                  />
                                </div>

                                {(user?.id === reply.author.id || isOwner) && (
                                  <button
                                    className="text-black/40 hover:text-red-500 
                                    transition-colors shrink-0 ml-2 mt-0.5"
                                    onClick={() => handleDelete(reply.id)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
