import {
  requestAccess as apiRequestAccess,
  getPendingRequests as apiGetPendingRequests,
  approveRequest as apiApproveRequest,
  denyRequest as apiDenyRequest,
} from "./accessRequest.api";

export const accessRequestService = {
  async requestAccess(documentId: string, requestedRole: "VIEWER" | "EDITOR") {
    return apiRequestAccess(documentId, requestedRole);
  },

  async getPendingRequests(documentId: string) {
    return apiGetPendingRequests(documentId);
  },

  async approveRequest(id: string, role: "EDITOR" | "VIEWER") {
    return apiApproveRequest(id, role);
  },

  async denyRequest(id: string) {
    return apiDenyRequest(id);
  },
};
