import { httpClient } from "../../lib/httpClient";
import type { Comment, CreateCommentData } from "./comment.types";

export const getComments = (documentId: string) => {
  return httpClient.get<Comment[]>(`/api/comment/${documentId}`);
};

export const createComment = (documentId: string, data: CreateCommentData) => {
  return httpClient.post<Comment>(`/api/comment/${documentId}`, data);
};

export const updateComment = (id: string, data: { content: string }) => {
  return httpClient.put<Comment>(`/api/comment/${id}`, data);
};

export const deleteComment = (id: string) => {
  return httpClient.delete(`/api/comment/${id}`);
};

export const resolveComment = (id: string) => {
  return httpClient.put<Comment>(`/api/comment/${id}/resolve`, {});
};
