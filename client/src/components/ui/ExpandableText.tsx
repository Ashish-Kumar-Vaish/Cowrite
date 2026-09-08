import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({
  text,
  maxLength = 150,
  className,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > maxLength;
  const display =
    expanded || !isLong ? text : text.slice(0, maxLength).trimEnd() + "…";

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap wrap-break-word">{display}</span>

      {isLong && (
        <button
          type="button"
          className="block text-xs font-black text-black/40 hover:text-black 
          transition-colors mt-0.5"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
