import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Sparkle,
  CheckCheck,
  Star,
  X,
} from "lucide-react";
import { Marquee } from "../components/Marquee";
import { CountUp } from "../components/CountUp";
import { STATS } from "../content/landing/stats";
import { HOW_IT_WORKS } from "../content/landing/howItWorks";
import { TECH_HIGHLIGHTS } from "../content/landing/techHighlights";
import { AVATAR_COLORS } from "../content/landing/avatarColors";
import { COMPARISON } from "../content/landing/comparison";
import { PILLS } from "../content/landing/pills";
import { cn } from "../utils/cn";

export function LandingPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section
        className="min-h-[calc(100vh-64px)] bg-amber-50 relative flex 
        flex-col justify-center overflow-hidden px-6 py-20"
      >
        <div
          className="sticker absolute top-10 right-8 md:top-16 md:right-24 bg-yellow-300 
          px-4 py-2 z-10 text-xs font-black uppercase tracking-widest rotate-3 hidden 
          md:flex items-center gap-1.5"
        >
          100% Free <Sparkle size={12} fill="black" />
        </div>

        <div
          className="absolute -right-2.5 top-28 md:right-16 lg:right-36 hidden md:block
          animate-[float_4.5s_ease-in-out_infinite]"
        >
          <div className="bg-white brutal-card w-60 p-5">
            <div className="h-3 bg-black mb-4 w-3/5" />

            <div className="space-y-2 mb-5">
              <div className="h-2.5 bg-gray-100 border border-gray-200 w-full" />
              <div className="h-2.5 bg-gray-100 border border-gray-200 w-5/6" />
              <div className="h-2.5 bg-gray-100 border border-gray-200 w-4/6" />
              <div className="h-2.5 bg-pink-300 border border-pink-200 w-3/4 opacity-60" />
            </div>

            <div className="border-t-2 border-black pt-3 flex items-center">
              {AVATAR_COLORS.map(({ bg, letter }, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-3xs font-black",
                    bg,
                    i > 0 && "-ml-1.5",
                  )}
                >
                  {letter}
                </div>
              ))}

              <span className="text-2xs font-bold text-black/50 ml-2">
                3 editing
              </span>
            </div>

            <div className="relative mt-2 h-4">
              <div className="cursor-dot bg-pink-300 left-3 top-0" />

              <div className="cursor-dot bg-yellow-300 left-10 top-0.5" />
            </div>
          </div>
        </div>

        <div
          className="absolute right-10 bottom-28 md:right-36 hidden md:block 
          animate-[floatB_5.5s_ease-in-out_infinite]"
        >
          <div
            className="brutal-card bg-zinc-900 text-white px-4 py-3 text-xs 
            font-bold whitespace-nowrap"
          >
            <CheckCheck size={16} className="inline text-lime-300 mr-1" />
            Saved automatically
            <br />
            <span className="text-white/40 font-normal">just now</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div
            className="inline-flex items-center gap-3 bg-pink-300 border-3 
            border-black px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-8"
          >
            {PILLS.map(({ icon: Icon, label }, i) => (
              <>
                {i > 0 && (
                  <Star
                    key={`sep-${i}`}
                    size={8}
                    fill="black"
                    className="opacity-35"
                  />
                )}

                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={11} strokeWidth={3} /> {label}
                </span>
              </>
            ))}
          </div>

          <h1
            className="serif leading-[0.92] tracking-tight mb-8 text-black 
            text-[clamp(4rem,12vw,9rem)] selection:bg-black/80 selection:text-yellow-500"
          >
            Write together.
            <br />
            <span className="italic text-black/20">Right now.</span>
          </h1>

          <p className="text-black/60 text-lg font-medium max-w-lg mb-8 leading-relaxed">
            The document editor that gets out of your way.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="brutal-btn btn-black text-base px-8 py-4"
            >
              Start writing free <ArrowRight size={18} />
            </Link>

            <Link
              to="/about"
              className="brutal-btn btn-secondary text-base px-8 py-4"
            >
              See how it works
            </Link>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col 
          items-center gap-1 opacity-70"
        >
          <span className="text-xs font-black uppercase tracking-widest">
            Scroll
          </span>

          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      <Marquee />

      {/* STATS */}
      <section className="border-b-4 border-black bg-white px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={cn(
                "brutal-card brutal-card-hover p-6 flex flex-col items-start gap-3 cursor-default",
                stat.bg,
              )}
            >
              <stat.icon size={20} strokeWidth={2.5} />

              <p className="font-black text-5xl leading-none">
                <CountUp end={stat.value} />
                {stat.suffix}
              </p>

              <p
                className="text-sm font-bold uppercase tracking-wider text-black/50 
                leading-snug"
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b-4 border-black bg-amber-50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-3">
              How it works
            </p>

            <h2 className="serif leading-none text-black text-[clamp(2.5rem,7vw,5rem)]">
              Dead simple.
              <br />
              <span className="italic text-black/25">Seriously.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "brutal-card brutal-card-hover p-7 flex flex-col justify-between gap-6 cursor-default group",
                  item.bg,
                )}
              >
                <span
                  className="font-black text-7xl leading-none text-black/15 
                group-hover:text-black/25 transition-colors"
                >
                  {item.step}
                </span>

                <div>
                  <h3 className="font-black text-2xl mb-2 flex items-center justify-between">
                    {item.title}
                    <ArrowRight
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </h3>

                  <p className="text-sm text-black/55 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNDER THE HOOD */}
      <section className="border-b-4 border-black bg-black px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">
              Under the hood
            </p>

            <h2 className="serif text-white leading-none text-[clamp(2.5rem,7vw,5rem)]">
              Built different.
              <br />
              <span className="italic text-white/25">
                Not just another editor.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/10">
            {TECH_HIGHLIGHTS.map((item, i) => (
              <div
                key={i}
                className="bg-black hover:bg-rose-400 p-6 flex flex-col gap-4 
                transition-colors duration-100 cursor-default group"
              >
                <item.icon
                  size={20}
                  strokeWidth={2.5}
                  className="text-white/40 group-hover:text-black transition-colors 
                  duration-100"
                />

                <div>
                  <h3
                    className="text-lg text-white font-black  mb-1 group-hover:text-black 
                    transition-colors duration-100"
                  >
                    {item.label}
                  </h3>

                  <p
                    className="text-sm text-white/40 font-medium group-hover:text-black/60 
                    transition-colors duration-100"
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-b-4 border-black bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-black/30 mb-3">
              Why this?
            </p>

            <h2 className="serif leading-none text-[clamp(2.5rem,7vw,5rem)]">
              Not your average
              <br />
              <span className="italic text-black/20">document editor.</span>
            </h2>
          </div>

          <div className="brutal-card overflow-hidden">
            <div className="grid grid-cols-3 bg-black text-white border-b-3 border-black">
              <div className="p-4 text-xs font-black uppercase tracking-widest text-white/50">
                Feature
              </div>

              <div
                className="p-4 text-xs font-black uppercase tracking-widest border-l-3 
                border-white/10 text-center text-pink-300"
              >
                This app
              </div>

              <div
                className="p-4 text-xs font-black uppercase tracking-widest border-l-3 
                border-white/10 text-center text-white/50"
              >
                Others
              </div>
            </div>

            {/* Rows */}
            {COMPARISON.map(({ feature, ours, theirs }, i) => (
              <div
                key={i}
                className="grid grid-cols-3 border-b-3 border-black last:border-b-0 
                hover:bg-sky-50 transition-colors duration-100 group"
              >
                <div
                  className="p-4 text-sm font-black text-black/70 group-hover:text-black 
                  transition-colors"
                >
                  {feature}
                </div>

                <div className="p-4 border-l-3 border-black flex items-center justify-center">
                  {ours ? (
                    <CheckCheck size={18} strokeWidth={3} />
                  ) : (
                    <X size={18} strokeWidth={3} className="text-black/20" />
                  )}
                </div>

                <div className="p-4 border-l-3 border-black flex items-center justify-center">
                  {theirs ? (
                    <CheckCheck size={18} strokeWidth={3} />
                  ) : (
                    <X size={18} strokeWidth={3} className="text-black/20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-amber-50 border-b-4 border-black px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div
            className="brutal-card bg-yellow-300 p-10 md:p-16 flex flex-col md:flex-row 
            items-start md:items-center justify-between gap-10"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">
                Ready?
              </p>

              <h2
                className="serif leading-none tracking-tight mb-4 text-black 
                text-[clamp(3rem,9vw,7rem)]"
              >
                Start now.
                <br />
                <span className="italic text-black/25">It's free.</span>
              </h2>

              <p className="text-black/55 font-medium md:text-lg">
                No credit card. No setup. Just write.
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/register"
                className="brutal-btn btn-black text-base px-10 py-4 justify-center"
              >
                Create free account <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="brutal-btn btn-secondary text-base px-10 py-4 justify-center"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
