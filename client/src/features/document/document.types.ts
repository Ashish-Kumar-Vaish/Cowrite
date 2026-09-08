export interface Document {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  collaborators: {
    role: "EDITOR" | "VIEWER";
    user: {
      id: string;
      name: string;
      username: string;
      avatar: string;
    };
  }[];
}

export interface CreateDocumentInput {
  title?: string;
}

export interface UpdateDocumentTitleInput {
  title?: string;
}

export interface PaginatedDocuments {
  documents: Document[];
  total: number;
  hasMore: boolean;
}
