export interface Comment {
  id: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  selectedText: string | null;
  fromPos: number | null;
  toPos: number | null;
  author: { id: string; name: string; username: string; avatar: string };
  replies: Comment[];
  parentId: string | null;
}

export interface CreateCommentData {
  content: string;
  parentId?: string | null;
  selectedText?: string | null;
  fromPos?: number | null;
  toPos?: number | null;
}