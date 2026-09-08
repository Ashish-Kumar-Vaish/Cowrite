export interface AccessRequest {
  id: string;
  requestedRole: "VIEWER" | "EDITOR";
  status: "PENDING" | "APPROVED" | "DENIED";
  createdAt: string;
  user: { id: string; name: string; username: string; avatar: string };
}
