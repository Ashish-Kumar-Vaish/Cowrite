import { cn } from "../../../utils/cn";

type Filter = "recent" | "mine" | "shared";

const FILTERS: { value: Filter; label: string; activeBg: string }[] = [
  { value: "recent", label: "Recent", activeBg: "bg-yellow-300" },
  { value: "mine", label: "Mine", activeBg: "bg-pink-300" },
  { value: "shared", label: "Shared", activeBg: "bg-lime-200" },
];

interface DocumentsFilterProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
}

export function DocumentsFilter({ filter, onChange }: DocumentsFilterProps) {
  return (
    <div className="flex items-center">
      {FILTERS.map(({ value, label, activeBg }) => {
        const isActive = filter === value;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              `px-6 py-4 font-black uppercase tracking-widest border-r-4 border-black 
              last:border-r-0 transition-colors duration-100 cursor-pointer`,
              isActive
                ? cn(activeBg, "text-black")
                : "bg-white text-black/30 hover:text-black hover:bg-black/5",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
