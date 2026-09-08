const COLORS = [
  {
    bg: "bg-red-500",
    text: "text-white",
    border: "border-red-600",
    hex: "#ef4444",
  },
  {
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-600",
    hex: "#f97316",
  },
  {
    bg: "bg-amber-400",
    text: "text-black",
    border: "border-amber-500",
    hex: "#fbbf24",
  },
  {
    bg: "bg-lime-400",
    text: "text-black",
    border: "border-lime-500",
    hex: "#a3e635",
  },
  {
    bg: "bg-emerald-500",
    text: "text-white",
    border: "border-emerald-600",
    hex: "#10b981",
  },
  {
    bg: "bg-cyan-400",
    text: "text-black",
    border: "border-cyan-500",
    hex: "#22d3ee",
  },
  {
    bg: "bg-blue-600",
    text: "text-white",
    border: "border-blue-700",
    hex: "#2563eb",
  },
  {
    bg: "bg-violet-600",
    text: "text-white",
    border: "border-violet-700",
    hex: "#7c3aed",
  },
  {
    bg: "bg-fuchsia-500",
    text: "text-white",
    border: "border-fuchsia-600",
    hex: "#d946ef",
  },
  {
    bg: "bg-rose-500",
    text: "text-white",
    border: "border-rose-600",
    hex: "#f43f5e",
  },
];

function hashString(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return hash >>> 0;
}

export function generateColor(seed: string): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  return COLORS[hashString(seed) % COLORS.length];
}
