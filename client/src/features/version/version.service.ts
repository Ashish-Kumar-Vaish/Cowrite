import {
  getVersions as apiGetVersions,
  createVersion as apiCreateVersion,
  restoreVersion as apiRestoreVersion,
  deleteVersion as apiDeleteVersion,
} from "./version.api";

export const versionService = {
  async getVersions(documentId: string) {
    return apiGetVersions(documentId);
  },

  async createVersion(documentId: string, title: string, content: string) {
    return apiCreateVersion(documentId, { title, content });
  },

  async restoreVersion(id: string) {
    return apiRestoreVersion(id);
  },

  async deleteVersion(id: string) {
    return apiDeleteVersion(id);
  },
};
