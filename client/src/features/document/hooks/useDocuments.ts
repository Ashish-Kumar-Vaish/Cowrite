import { useCallback, useEffect, useRef, useState } from "react";
import { documentService } from "../document.service";
import type { Document } from "../document.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useDocuments(filter: "recent" | "mine" | "shared" | "all") {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const page = useRef(1);

  const loadingMoreRef = useRef(loadingMore);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    page.current = 1;

    try {
      const data =
        filter === "recent"
          ? await documentService.getRecentDocuments(1, 20)
          : await documentService.getAllDocuments(1, 20, filter);

      setDocuments(data.documents);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load documents"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = page.current + 1;
      const data =
        filter === "recent"
          ? await documentService.getRecentDocuments(nextPage, 20)
          : await documentService.getAllDocuments(nextPage, 20, filter);

      setDocuments((prev) => [...prev, ...data.documents]);
      setHasMore(data.hasMore);
      page.current = nextPage;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load more"));
    } finally {
      setLoadingMore(false);
    }
  }, [filter]);

  return { documents, loading, loadingMore, error, hasMore, total, loadMore };
}
