import {
  getComments as apiGetComments,
  createComment as apiCreateComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
  resolveComment as apiResolveComment,
} from "./comment.api";
import type { CreateCommentData } from "./comment.types";

export const commentService = {
  async getComments(documentId: string) {
    return apiGetComments(documentId);
  },

  async createComment(
    documentId: string,
    data: CreateCommentData,
  ) {
    return apiCreateComment(documentId, data);
  },

  async updateComment(id: string, content: string) {
    return apiUpdateComment(id, { content });
  },

  async deleteComment(id: string) {
    return apiDeleteComment(id);
  },

  async resolveComment(id: string) {
    return apiResolveComment(id);
  },
};
