import { cn } from "../../../utils/cn";
import { Avatar } from "../../../components/ui/Avatar";

interface ProfileHeaderProps {
  label: string;
  name: string;
  username: string;
  avatar?: string | null;
  bg: string;
  dark?: boolean;
  rightContent?: React.ReactNode;
}

export function ProfileHeader({
  label,
  name,
  username,
  avatar,
  bg,
  dark = false,
  rightContent,
}: ProfileHeaderProps) {
  const textMuted = dark ? "text-white/30" : "text-black/40";
  const textMain = dark ? "text-white" : "text-black";
  const textSub = dark ? "text-white/30" : "text-black/30";
  const shadow = dark
    ? "shadow-[4px_4px_0_#c0c0c0]"
    : "shadow-[4px_4px_0_#000]";

  return (
    <div className={cn("border-b-4 border-black px-6 py-10", bg)}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col gap-6">
          <p
            className={cn(
              "text-xs font-black uppercase tracking-widest",
              textMuted,
            )}
          >
            {label}
          </p>

          <div className="flex items-center gap-6">
            <Avatar
              name={name}
              avatar={avatar}
              className={cn("w-20 h-20 md:w-40 md:h-40", shadow)}
            />

            <div
              className={cn(
                "serif text-[clamp(2rem,6vw,4.5rem)] leading-none", // somehow the placement/order of leading none is affecting the styling
                textMain,
              )}
            >
              {name}
              <br />
              <span className={cn("italic", textSub)}>@{username}</span>
            </div>
          </div>
        </div>

        {rightContent && <div className="self-end">{rightContent}</div>}
      </div>
    </div>
  );
}
