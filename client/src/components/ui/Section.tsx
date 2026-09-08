import { cn } from "../../utils/cn";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}

export function Section({ title, children, danger = false }: SectionProps) {
  return (
    <div className="brutal-card overflow-hidden">
      <div
        className={cn(
          "border-b-3 border-black px-6 py-3",
          danger ? "bg-red-500" : "bg-black",
        )}
      >
        <p
          className={cn(
            "text-xs font-black uppercase tracking-widest",
            danger ? "text-white/80" : "text-white/50",
          )}
        >
          {title}
        </p>
      </div>

      <div className="bg-white px-6 py-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}
