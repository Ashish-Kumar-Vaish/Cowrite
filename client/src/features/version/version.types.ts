export interface Version {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; username: string; avatar: string };
  changeSummary: string | null;
}
