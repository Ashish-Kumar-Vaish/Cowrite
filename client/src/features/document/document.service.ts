import {
  getAllDocuments as apiGetAllDocuments,
  getRecentDocuments as apiGetRecentDocuments,
  getDocument as apiGetDocument,
  createDocument as apiCreateDocument,
  updateDocumentTitle as apiUpdateDocumentTitle,
  deleteDocument as apiDeleteDocument,
  updateVisibility as apiUpdateVisibility,
  addCollaborator as apiAddCollaborator,
  removeCollaborator as apiRemoveCollaborator,
  exportDocument as apiExportDocument,
} from "./document.api";
import type {
  CreateDocumentInput,
  UpdateDocumentTitleInput,
} from "./document.types";

export const documentService = {
  async getAllDocuments(
    page = 1,
    limit = 20,
    filter: "all" | "mine" | "shared" = "all",
  ) {
    return apiGetAllDocuments(page, limit, filter);
  },

  async getRecentDocuments(page = 1, limit = 20) {
    return apiGetRecentDocuments(page, limit);
  },

  async getDocument(id: string) {
    return apiGetDocument(id);
  },

  async createDocument(data: CreateDocumentInput = {}) {
    return apiCreateDocument(data);
  },

  async updateDocumentTitle(id: string, data: UpdateDocumentTitleInput) {
    return apiUpdateDocumentTitle(id, data);
  },

  async deleteDocument(id: string) {
    return apiDeleteDocument(id);
  },

  async updateVisibility(id: string, isPublic: boolean) {
    return apiUpdateVisibility(id, isPublic);
  },

  async addCollaborator(id: string, userId: string, role: "EDITOR" | "VIEWER") {
    return apiAddCollaborator(id, userId, role);
  },

  async removeCollaborator(id: string, userId: string) {
    return apiRemoveCollaborator(id, userId);
  },

  async exportDocument(id: string, format: "pdf" | "docx") {
    return apiExportDocument(id, format);
  },
};
