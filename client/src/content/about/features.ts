import { Users, Zap, Lock, FileText, History, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const FEATURES: {
  icon: LucideIcon;
  bg: string;
  title: string;
  description: string;
}[] = [
  {
    icon: Zap,
    bg: "bg-yellow-300",
    title: "Real-Time Collaboration",
    description:
      "Edit documents simultaneously with your team. Changes sync instantly across all connected users using conflict-free replicated data types (CRDTs).",
  },
  {
    icon: Users,
    bg: "bg-pink-300",
    title: "Granular Permissions",
    description:
      "Invite collaborators as Editors or Viewers. Owners have full control — add, remove, and manage access at any time.",
  },
  {
    icon: Link2,
    bg: "bg-lime-200",
    title: "Shareable Invite Links",
    description:
      "Generate time-limited invite links with a specific role. Anyone with the link can join the document instantly.",
  },
  {
    icon: History,
    bg: "bg-white",
    title: "Version History",
    description:
      "Every document is auto-versioned every 2 minutes. Restore any previous version with a single click.",
  },
  {
    icon: Lock,
    bg: "bg-violet-300",
    title: "Public & Private Docs",
    description:
      "Make documents public for anyone to view, or keep them private. You stay in control of who sees what.",
  },
  {
    icon: FileText,
    bg: "bg-amber-200",
    title: "Export Anywhere",
    description:
      "Download your documents as .docx or .pdf at any time. Your content is never locked in.",
  },
];
