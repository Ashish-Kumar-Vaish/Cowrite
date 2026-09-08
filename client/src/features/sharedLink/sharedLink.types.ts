export interface SharedLink {
  id: string;
  token: string;
  role: "EDITOR" | "VIEWER";
  expiresAt: string | null;
  createdAt: string;
  documentId: string;
}

export interface SharedLinkWithDocument extends SharedLink {
  document: {
    id: string;
    title: string;
    ownerId: string;
  };
}