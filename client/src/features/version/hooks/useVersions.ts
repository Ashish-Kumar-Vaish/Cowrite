import { useCallback, useEffect, useState } from "react";
import { versionService } from "../version.service";
import type { Version } from "../version.types";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useVersions(documentId: string, enabled: boolean) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await versionService.getVersions(documentId);

      setVersions(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch versions"));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (enabled) {
      fetchVersions();
    }
  }, [enabled, fetchVersions]);

  return { versions, loading, error, refetch: fetchVersions };
}
