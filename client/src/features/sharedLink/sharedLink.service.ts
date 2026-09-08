import {
  createSharedLink as apiCreateSharedLink,
  getSharedLinks as apiGetSharedLinks,
  joinViaSharedLink as apiJoinViaSharedLink,
  getSharedLinkByToken as apiGetSharedLinkByToken,
  revokeSharedLink as apiRevokeSharedLink,
} from "./sharedLink.api";

export const sharedLinkService = {
  async createSharedLink(
    documentId: string,
    role: "EDITOR" | "VIEWER",
    expiresAt?: string,
  ) {
    return apiCreateSharedLink(documentId, { role, expiresAt });
  },

  async getSharedLinks(documentId: string) {
    return apiGetSharedLinks(documentId);
  },

  async joinViaSharedLink(token: string) {
    return apiJoinViaSharedLink(token);
  },

  async getSharedLinkByToken(token: string) {
    return apiGetSharedLinkByToken(token);
  },

  async revokeSharedLink(id: string) {
    return apiRevokeSharedLink(id);
  },
};
