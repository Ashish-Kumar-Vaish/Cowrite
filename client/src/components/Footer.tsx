import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "../config/nav";

export function Footer() {
  return (
    <footer className="bg-black px-6 py-8 border-t-4 border-black">
      <div
        className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start justify-between 
        flex-wrap gap-12 sm:gap-4"
      >
        <div className="font-black text-md text-white/50 uppercase tracking-widest shrink-0">
          <Link to="/">
            <img
              src="/cowrite_wordmark.png"
              alt="Cowrite Wordmark"
              className="h-12 max-w-none mb-4 dark:invert select-none"
              draggable={false}
            />
          </Link>
          Built with obsession.
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-white/40 hover:text-pink-300 text-sm font-black uppercase 
              tracking-widest transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
