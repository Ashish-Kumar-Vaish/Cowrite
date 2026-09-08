import { httpClient } from "../../lib/httpClient";
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentTitleInput,
  PaginatedDocuments,
} from "./document.types";

export const getAllDocuments = (
  page?: number,
  limit?: number,
  filter?: "all" | "mine" | "shared",
) => {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set("page", String(page));
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  if (filter !== undefined) {
    params.set("filter", filter);
  }

  return httpClient.get<PaginatedDocuments>(`/api/document?${params}`);
};

export const getRecentDocuments = (page?: number, limit?: number) => {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set("page", String(page));
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  return httpClient.get<PaginatedDocuments>(`/api/document/recent?${params}`);
};

export const getDocument = (id: string) => {
  return httpClient.get<Document>(`/api/document/${id}`);
};

export const createDocument = (data: CreateDocumentInput) => {
  return httpClient.post<Document>("/api/document", data);
};

export const updateDocumentTitle = (
  id: string,
  data: UpdateDocumentTitleInput,
) => {
  return httpClient.put<Document>(`/api/document/${id}`, data);
};

export const deleteDocument = (id: string) => {
  return httpClient.delete(`/api/document/${id}`);
};

export const updateVisibility = (id: string, isPublic: boolean) => {
  return httpClient.put<Document>(`/api/document/${id}/visibility`, {
    isPublic,
  });
};

export const addCollaborator = (
  id: string,
  userId: string,
  role: "EDITOR" | "VIEWER",
) => {
  return httpClient.post(`/api/document/${id}/collaborator`, { userId, role });
};

export const removeCollaborator = (id: string, userId: string) => {
  return httpClient.delete(`/api/document/${id}/collaborator/${userId}`);
};

export const exportDocument = (id: string, format: "pdf" | "docx") => {
  return httpClient.get<Blob>(`/api/document/${id}/export?format=${format}`, {
    responseType: "blob",
  });
};
