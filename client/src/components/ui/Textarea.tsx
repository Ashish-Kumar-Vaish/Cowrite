import { useCallback } from "react";
import { cn } from "../../utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className, onInput, ...props }: TextareaProps) {
  const ref = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) {
      return;
    }

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
    // e.currentTarget is the textarea that triggered the input event
    const el = e.currentTarget;

    // Auto resets the height so the textarea can shrink
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;

    onInput?.(e);
  };

  return (
    <textarea
      ref={ref}
      className={cn(
        `border-2 border-black rounded px-3 py-2 text-sm font-medium bg-white 
        focus:outline-none focus:shadow-[3px_3px_0_#000] transition-shadow w-full 
        resize-none overflow-hidden`,
        className,
      )}
      onInput={handleInput}
      {...props}
    />
  );
}
