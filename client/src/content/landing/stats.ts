import { Zap, Users, Clock, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const STATS: {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  bg: string;
}[] = [
  {
    value: 2,
    suffix: " min",
    label: "Snapshot interval",
    icon: Clock,
    bg: "bg-yellow-300",
  },
  {
    value: 3,
    suffix: " roles",
    label: "Owner · Editor · Viewer",
    icon: Users,
    bg: "bg-pink-300",
  },
  {
    value: 0,
    suffix: " lag",
    label: "Yjs CRDT sync",
    icon: Zap,
    bg: "bg-lime-200",
  },
  {
    value: 100,
    suffix: "%",
    label: "Free forever",
    icon: Globe,
    bg: "bg-violet-300",
  },
];
