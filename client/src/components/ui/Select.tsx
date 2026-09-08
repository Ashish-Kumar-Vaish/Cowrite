import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({ value, onChange, options, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close the dropdown if the click is outside of the component
      // e.target is the DOM element that was clicked
      // contains() checks whether the clicked element is inside the element referenced by ref
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-3 py-1.5 border-2 border-black 
        bg-white font-black text-sm focus:outline-none focus:shadow-[3px_3px_0_#000] 
        transition-shadow w-full justify-between"
      >
        {selected?.label}
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 border-2 border-black 
         bg-white shadow-[4px_4px_0_#000] min-w-full"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-black transition-colors text-left",
                option.value === value
                  ? "bg-yellow-300"
                  : "bg-white hover:bg-amber-50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
