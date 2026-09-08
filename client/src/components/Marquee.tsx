import { Star } from "lucide-react";
import { MARQUEE_ITEMS } from "../content/landing/marquee";

export function Marquee() {
  return (
    <div
      className="overflow-hidden border-y-4 border-black bg-pink-300 py-3 select-none"
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap w-max"
        style={{ animation: "marquee 20s linear infinite" }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-black font-black text-sm 
            uppercase tracking-widest px-8 gap-3"
          >
            {item}
            <Star size={10} fill="black" className="opacity-40" />
          </span>
        ))}
      </div>
    </div>
  );
}
