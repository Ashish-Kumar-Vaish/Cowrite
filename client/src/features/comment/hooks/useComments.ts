import { useCallback, useEffect, useState } from "react";
import { commentService } from "../comment.service";
import type { Comment } from "../comment.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useComments(documentId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await commentService.getComments(documentId);

      setComments(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch comments"));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, setComments, refetch: fetchComments };
}
