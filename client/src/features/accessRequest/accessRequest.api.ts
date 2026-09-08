import { httpClient } from "../../lib/httpClient";
import type { AccessRequest } from "./accessRequest.types";

export const requestAccess = (
  documentId: string,
  requestedRole: "VIEWER" | "EDITOR" = "VIEWER",
) => {
  return httpClient.post(`/api/access-request/${documentId}`, {
    requestedRole,
  });
};

export const getPendingRequests = (documentId: string) => {
  return httpClient.get<AccessRequest[]>(`/api/access-request/${documentId}`);
};

export const approveRequest = (id: string, role: "EDITOR" | "VIEWER") => {
  return httpClient.put(`/api/access-request/${id}/approve`, { role });
};

export const denyRequest = (id: string) => {
  return httpClient.put(`/api/access-request/${id}/deny`, {});
};
