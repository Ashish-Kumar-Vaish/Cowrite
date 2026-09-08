import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  className?: string;
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          `border-2 border-black px-3 py-2 text-sm font-medium bg-white w-full 
          pr-10 focus:outline-none focus:shadow-[3px_3px_0_#000] transition-shadow rounded`,
          className,
        )}
        {...props}
      />

      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        // Can include tabIndex={-1} to skip focus on hide/show
        // tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 
        hover:text-black transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
