import { useCallback, useEffect, useRef, useState } from "react";
import { documentService } from "../document.service";
import type { Document } from "../document.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useDocument(id: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const isInitialLoad = useRef(true);

  const fetchDocument = useCallback(async () => {
    if (isInitialLoad.current) {
      setLoading(true);
    }

    setError(null);
    setErrorStatus(null);

    try {
      const data = await documentService.getDocument(id);

      setDocument(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load document"));
      setErrorStatus(err instanceof Response ? err.status : null);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [id]);

  useEffect(() => {
    isInitialLoad.current = true;
    fetchDocument();
  }, [fetchDocument]);

  return {
    document,
    loading,
    error,
    errorStatus,
    setDocument,
    refetch: fetchDocument,
  };
}
