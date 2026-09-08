import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        `inline-flex items-center justify-center gap-2 cursor-pointer border-2 border-black
        rounded font-[inherit] transition-transform hover:-translate-1 hover:shadow-[4px_4px_0_#000] 
        active:translate-0 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed select-none
        disabled:hover:translate-0 disabled:hover:shadow-none px-3 py-2 leading-snug`,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
