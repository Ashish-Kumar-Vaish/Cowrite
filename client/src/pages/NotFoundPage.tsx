import { Link } from "react-router-dom";
import { MoveLeft, MoveRight, Sparkle } from "lucide-react";
import { useAuth } from "../features/auth";

export function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-amber-50 flex flex-col items-center justify-center 
      px-6 relative overflow-hidden"
    >
      {/* Stickers */}
      <div
        className="sticker absolute top-10 right-8 md:top-16 md:right-24 bg-pink-300 px-4 py-2 
        text-xs font-black uppercase tracking-widest rotate-4 hidden md:block"
      >
        Oops :(
      </div>

      <div
        className="sticker absolute top-8 left-8 md:left-16 bg-yellow-300 px-4 py-2 
        text-xs font-black uppercase tracking-widest -rotate-6 hidden md:block"
      >
        Lost?
      </div>

      <div
        className="sticker absolute bottom-12 left-8 md:left-24 bg-lime-200 px-4 py-2 
        text-xs font-black uppercase tracking-widest rotate-3 hidden md:flex justify-center
        items-center gap-1.5 shrink-0"
      >
        404 <Sparkle size={12} fill="black" />
      </div>

      <div
        className="sticker absolute bottom-12 right-8 md:right-24 bg-violet-300 px-4 py-2 
        text-xs font-black uppercase tracking-widest -rotate-4 hidden md:block"
      >
        Not here!
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <p
          className="serif font-normal leading-none text-black fade-up-1 
          text-[clamp(8rem,25vw,18rem)]"
        >
          404
        </p>

        <div className="w-full h-1 bg-black mb-8 fade-up-2" />

        <h1 className="font-black text-2xl uppercase tracking-widest mb-3 fade-up-2">
          Page not found
        </h1>

        <p className="text-black/50 font-medium text-base leading-relaxed mb-10 fade-up-3">
          Whatever you were looking for doesn't exist,
          <br />
          was moved, or never existed to begin with.
        </p>

        <div className="flex flex-wrap gap-4 justify-center fade-up-4">
          <Link to="/" className="brutal-btn btn-secondary">
            <MoveLeft size={16} strokeWidth={3} /> Go home
          </Link>

          <Link
            to={user ? "/dashboard" : "/login"}
            className="brutal-btn btn-black"
          >
            {user ? "Dashboard" : "Sign in"}
            <MoveRight size={16} strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}
