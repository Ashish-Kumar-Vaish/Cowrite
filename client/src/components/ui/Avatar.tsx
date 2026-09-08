import { cn } from "../../utils/cn";
import { generateColor } from "../../utils/generateColor";

interface AvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
}

export function Avatar({ name, avatar, className }: AvatarProps) {
  const { bg, text } = generateColor(name);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        `@container rounded-full border-2 border-black overflow-hidden 
        flex items-center justify-center shrink-0 select-none`,
        avatar ? "bg-gray-100" : bg,
        className,
      )}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={cn("text-[45cqw] font-bold", text)}>{initials}</span>
      )}
    </div>
  );
}
