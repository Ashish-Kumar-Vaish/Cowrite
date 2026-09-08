import { cn } from "../../utils/cn";

interface TripleHoverButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  firstBlockClassName?: string;
  secondBlockClassName?: string;
}

export function TripleHoverButton({
  children,
  className,
  onClick,
  firstBlockClassName,
  secondBlockClassName,
}: TripleHoverButtonProps) {
  return (
    <div className="relative inline-block group">
      <button
        className={cn(
          `relative inline-flex rounded-sm items-center justify-center gap-1 border
          border-black transition-all duration-150 group-hover:-translate-x-2 
          group-hover:-translate-y-2 z-3 w-full lg:w-auto cursor-pointer h-14 px-8 text-lg 
          lg:h-16 lg:px-10 lg:text-xl bg-black text-white`,
          className,
        )}
        onClick={onClick}
      >
        {children}
      </button>

      <div
        className={cn(
          `absolute inset-0 rounded-sm bg-yellow-300 border border-black transition-transform 
          duration-150 z-2`,
          firstBlockClassName,
        )}
      />

      <div
        className={cn(
          `absolute inset-0 rounded-sm bg-red-600 border border-black transition-transform 
          duration-150 group-hover:translate-x-2 group-hover:translate-y-2 z-1`,
          secondBlockClassName,
        )}
      />
    </div>
  );
}
