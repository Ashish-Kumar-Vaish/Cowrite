import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export function BrutalButton({
  children,
  className,
  ...props
}: BrutalButtonProps) {
  return (
    <button
      className={cn(
        `inline-flex items-center justify-center gap-2 cursor-pointer border-2 border-black 
        font-[inherit] transition-all hover:-translate-0.5 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] 
        active:shadow-[2px_2px_0_#000] active:translate-0.5 disabled:opacity-40 disabled:cursor-not-allowed select-none
        disabled:hover:translate-0 disabled:hover:shadow-[4px_4px_0_#000] px-3 py-2 leading-snug font-black`,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
