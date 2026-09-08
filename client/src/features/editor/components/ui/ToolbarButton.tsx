import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../utils/cn";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ToolbarButton({
  onClick,
  icon,
  active,
  disabled,
  className,
}: ToolbarButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-sm",
        active ? "btn-primary" : "btn-secondary",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {icon}
    </Button>
  );
}
