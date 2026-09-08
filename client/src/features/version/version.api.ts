import { httpClient } from "../../lib/httpClient";
import type { Version } from "./version.types";

export const getVersions = (documentId: string) => {
  return httpClient.get<Version[]>(`/api/version/${documentId}`);
};

export const createVersion = (
  documentId: string,
  data: { title: string; content: string },
) => {
  return httpClient.post<Version>(`/api/version/${documentId}`, data);
};

export const restoreVersion = (id: string) => {
  return httpClient.put(`/api/version/${id}/restore`, {});
};

export const deleteVersion = (id: string) => {
  return httpClient.delete(`/api/version/${id}`);
};
