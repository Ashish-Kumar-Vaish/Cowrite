import { httpClient } from "../../lib/httpClient";
import type { SharedLink, SharedLinkWithDocument } from "./sharedLink.types";

export const createSharedLink = (
  documentId: string,
  data: { role: "EDITOR" | "VIEWER"; expiresAt?: string },
) => {
  return httpClient.post<SharedLink>(`/api/shared-link/${documentId}`, data);
};

export const getSharedLinks = (documentId: string) => {
  return httpClient.get<SharedLink[]>(`/api/shared-link/${documentId}`);
};

export const joinViaSharedLink = (token: string) => {
  return httpClient.post<{ documentId: string }>(
    `/api/shared-link/join/${token}`,
  );
};

export const getSharedLinkByToken = (token: string) => {
  return httpClient.get<SharedLinkWithDocument>(
    `/api/shared-link/join/${token}`,
  );
};

export const revokeSharedLink = (id: string) => {
  return httpClient.delete(`/api/shared-link/${id}`);
};
