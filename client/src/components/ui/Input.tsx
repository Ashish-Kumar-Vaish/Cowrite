import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onClear?: () => void;
  wrapperClassName?: string;
}

export function Input({
  className,
  onClear,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <input
        className={cn(
          `border-2 border-black px-3 py-2 text-sm font-medium bg-white w-full
          focus:outline-none focus:shadow-[3px_3px_0_#000] transition-shadow rounded`,
          onClear && "pr-8",
          className,
        )}
        {...props}
      />

      {onClear && props.value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 
          hover:text-black transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
