import { User } from "lucide-react";
import { useAuth } from "../features/auth";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../config/nav";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

export function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const authLink = loading ? null : user ? (
    <Link to="/settings" className="nav-link" onClick={() => setIsOpen(false)}>
      <User size={24} />
    </Link>
  ) : (
    <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
      Log In
    </Link>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="flex items-center shrink-0">
        <img
          src="/logo.svg"
          alt="Cowrite Logo"
          className="h-12 mr-4"
          draggable={false}
        />

        <img
          src="/cowrite_wordmark.png"
          alt="Cowrite Wordmark"
          className="h-10 mr-2 dark:invert select-none"
          draggable={false}
        />
      </Link>

      <div className="hidden lg:flex lg:items-center">
        <div className="flex flex-col justify-center items-center lg:flex-row lg:gap-1 lg:px-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn("nav-btn", isActive && "bg-white text-black")
              }
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:h-full">{authLink}</div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex items-center lg:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-8 w-8 flex-col all-unset items-center 
          justify-center focus:outline-hidden"
        >
          <div
            className={cn(
              "mb-1 h-0.5 w-8 origin-center bg-black transition-transform duration-200 dark:bg-white",
              isOpen && "translate-y-1.5 rotate-45",
            )}
          />

          <div
            className={cn(
              "mt-1 h-0.5 w-8 origin-center bg-black transition-transform duration-200 dark:bg-white",
              isOpen && "-translate-y-1.5 -rotate-45",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          `justify-between border-b border-black top-20 left-0 right-0 z-50 
          flex-col fixed bg-black dark:border-white/35 lg:hidden`,
          isOpen ? "flex" : "hidden",
        )}
      >
        <div className="flex flex-col justify-center items-center lg:flex-row lg:gap-1 lg:px-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "nav-btn border-none rounded-none w-full",
                  isActive && "bg-zinc-800",
                )
              }
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:h-full">{authLink}</div>
      </div>
    </nav>
  );
}
