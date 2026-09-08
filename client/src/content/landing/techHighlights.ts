import { Zap, Globe, History, Link2, Lock, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const TECH_HIGHLIGHTS: {
  icon: LucideIcon;
  label: string;
  desc: string;
}[] = [
  { icon: Zap, label: "Real-time CRDTs", desc: "Conflict-free sync via Yjs" },
  {
    icon: History,
    label: "Version history",
    desc: "Auto-snapshot every 2 minutes",
  },
  {
    icon: Link2,
    label: "Shareable links",
    desc: "Role-based with optional expiry",
  },
  {
    icon: Lock,
    label: "Access control",
    desc: "Owner, Editor, Viewer permissions",
  },
  {
    icon: FileText,
    label: "Rich text editing",
    desc: "Powered by TipTap + ProseMirror",
  },
  { icon: Globe, label: "Public documents", desc: "Publish with one click" },
];
