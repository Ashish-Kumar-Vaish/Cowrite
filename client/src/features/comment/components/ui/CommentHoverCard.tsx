import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Comment } from "../../comment.types";
import { Avatar } from "../../../../components/ui/Avatar";

interface CommentHoverCardProps {
  comments: Comment[];
  containerRef: RefObject<HTMLElement | null>;
}

interface HoverTarget {
  comment: Comment;
  rect: DOMRect;
}

const CARD_WIDTH = 256;
const EDGE_PADDING = 8;
const FIXED_TOP = 120;
const HOVER_HIDE_DELAY = 150;

export function CommentHoverCard({
  comments,
  containerRef,
}: CommentHoverCardProps) {
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentsRef = useRef(comments);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-comment-id]",
      );

      if (!target) {
        return;
      }

      const commentId = target.getAttribute("data-comment-id");
      const comment = commentId
        ? commentsRef.current.find((c) => c.id === commentId)
        : undefined;

      if (!comment) {
        return;
      }

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }

      setHoverTarget({ comment, rect: target.getBoundingClientRect() });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;

      if (related?.closest("[data-comment-id]")) {
        return;
      }

      hideTimeout.current = setTimeout(() => {
        setHoverTarget(null);
        setPos(null);
      }, HOVER_HIDE_DELAY);
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [containerRef]);

  useLayoutEffect(() => {
    if (!hoverTarget || !cardRef.current) {
      return;
    }

    const cardHeight = cardRef.current.offsetHeight;
    const { rect } = hoverTarget;

    const top = Math.max(FIXED_TOP, rect.top - EDGE_PADDING - cardHeight);

    const rawLeft = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(rawLeft, CARD_WIDTH / 2 + EDGE_PADDING),
      window.innerWidth - CARD_WIDTH / 2 - EDGE_PADDING,
    );

    setPos({ top, left });
  }, [hoverTarget]);

  if (!hoverTarget) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="fixed z-50 -translate-x-1/2 bg-white border-2 border-black
      shadow-[3px_3px_0_#000] rounded p-3 w-64 pointer-events-none"
      style={{
        top: pos?.top ?? FIXED_TOP,
        left:
          pos?.left ?? hoverTarget.rect.left + CARD_WIDTH / 2 + EDGE_PADDING,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Avatar
          name={hoverTarget.comment.author.name}
          avatar={hoverTarget.comment.author.avatar}
          className="w-5 h-5 shrink-0"
        />

        <p className="text-xs font-black">{hoverTarget.comment.author.name}</p>
      </div>

      <p
        className="text-sm font-medium text-black/80 whitespace-pre-wrap 
        wrap-break-word line-clamp-3"
      >
        {hoverTarget.comment.content}
      </p>
    </div>
  );
}
