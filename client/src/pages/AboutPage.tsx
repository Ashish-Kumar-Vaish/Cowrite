import { ArrowRight, Heart, Pause, Play } from "lucide-react";
import { FEATURES } from "../content/about/features";
import { TECH_STACK } from "../content/about/techStack";
import { useRef, useState } from "react";
import { cn } from "../utils/cn";
import { SPECS } from "../content/about/specs";
import { useToast } from "../hooks/useToast";

export function AboutPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();

  const toggleVideo = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        toast("Video playback failed", "error");
      }
    } else {
      video.pause();
    }
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section className="border-b-4 border-black bg-black relative overflow-hidden">
        <div className="border-b-4 border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" />

            <span className="text-xs font-black uppercase tracking-widest text-white/40">
              About this project
            </span>
          </div>

          <span className="text-2xs font-black uppercase tracking-widest text-white/40">
            {"Made with "}
            <div className="inline-flex items-center justify-center">
              <Heart size={10} fill="pink" strokeWidth={0} />
            </div>
            {" by "}
            <a
              href="https://github.com/ashish-kumar-vaish"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 decoration-white/40 
              hover:text-pink-300 hover:decoration-pink-300 transition-colors"
            >
              Ashish Kumar Vaish
            </a>
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="serif text-white leading-[0.92] tracking-tight mb-8"
              style={{ fontSize: "clamp(3rem,8vw,6.5rem)" }}
            >
              Built for
              <br />
              <span className="text-pink-300">real teams.</span>
              <br />
              <span className="italic text-white/20">Not demos.</span>
            </h1>

            <p className="text-white/50 text-lg font-medium leading-relaxed max-w-md">
              A collaborative document editor with real-time sync, granular
              access control, version history, and zero friction.
            </p>
          </div>

          <div className="flex flex-col gap-px bg-white/10">
            {SPECS.map(({ label, value, bg }, i) => (
              <div
                key={i}
                className={cn(
                  `px-6 py-4 flex items-center justify-between group 
                  cursor-default hover:pl-10 transition-all duration-150`,
                  bg,
                )}
              >
                <span className="text-xs font-black uppercase tracking-widest text-black/50">
                  {label}
                </span>

                <span className="font-black text-base text-black">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="border-b-4 border-black px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <h2
              className="serif leading-none"
              style={{ fontSize: "clamp(2rem,6vw,4rem)" }}
            >
              See it in action.
            </h2>

            <p className="text-black/50 font-medium text-sm max-w-xs text-right">
              Multiple users editing the same document with no lag & no
              conflicts.
            </p>
          </div>

          <div className="brutal-card relative overflow-hidden">
            <video
              ref={videoRef}
              src="/about_vid_1.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full object-cover cursor-pointer"
              onClick={toggleVideo}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            <div
              className={cn(
                `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                w-36 h-36 flex items-center justify-center bg-black/70 text-white 
                rounded-full transition-opacity duration-300 pointer-events-none`,
                isPlaying ? "opacity-0" : "opacity-100",
              )}
            >
              {isPlaying ? (
                <Pause size={64} fill="white" strokeWidth={0} />
              ) : (
                <Play size={64} fill="white" strokeWidth={0} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b-4 border-black px-6 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">
              Features
            </p>

            <h2 className="serif text-white leading-none text-[clamp(2.5rem,7vw,5rem)]">
              Everything you need.
              <br />
              <span className="italic text-white/25">Nothing you don't.</span>
            </h2>
          </div>

          <div className="flex flex-col">
            {FEATURES.map((feature, i) => {
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={i}
                  className={cn(
                    `flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 
                    p-7 border-t-3 border-white/10 last:border-b-3 transition-colors 
                    duration-150 cursor-default`,
                    isHovered && feature.bg,
                  )}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span
                    className={cn(
                      "font-black text-6xl leading-none shrink-0 w-16 transition-colors",
                      isHovered ? "text-black/15" : "text-white/10",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={cn(
                      "w-12 h-12 border-3 flex items-center justify-center shrink-0 transition-colors",
                      isHovered ? "border-black" : "border-white/20",
                    )}
                  >
                    <feature.icon
                      size={20}
                      className={cn(
                        "transition-colors",
                        isHovered ? "text-black" : "text-white/60",
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-black text-xl mb-1 transition-colors",
                        isHovered ? "text-black" : "text-white",
                      )}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={cn(
                        "text-sm font-medium leading-relaxed transition-colors",
                        isHovered ? "text-black/60" : "text-white/40",
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={20}
                    className={cn(
                      "shrink-0 hidden md:block transition-all duration-150",
                      isHovered
                        ? "opacity-100 text-black"
                        : "opacity-0 text-white/20",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PICTURES */}
      <section className="border-b-4 border-black px-6 py-20 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-black/30 mb-3">
              Built for focus
            </p>

            <h2 className="serif leading-none text-[clamp(2.5rem,7vw,5rem)]">
              Designed to disappear.
              <br />
              <span className="italic text-black/20">Your work stays.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            <div className="md:col-span-3 flex flex-col gap-4">
              <div className="brutal-card overflow-hidden">
                <img
                  src="/about_img_1.png"
                  alt="Document editor interface"
                  className="w-full object-cover"
                />
              </div>

              <p className="text-sm font-medium text-black/50">
                A clean, distraction-free editor with zoom controls and a full
                formatting toolbar.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="brutal-card overflow-hidden">
                <img
                  src="/about_img_2.png"
                  alt="Collaboration features"
                  className="w-full object-cover"
                />
              </div>

              <p className="text-sm font-medium text-black/50">
                Live cursors show exactly where each collaborator is working in
                real time.
              </p>

              <div
                className="bg-yellow-300 border-3 border-black shadow-[5px_5px_0_#000] 
                p-6 flex flex-col gap-3"
              >
                <p className="font-black text-3xl">CRDTs</p>

                <p className="text-sm font-medium text-black/65 leading-relaxed">
                  Powered by Yjs - the same conflict-free sync used by Notion,
                  Linear, and Figma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="bg-black px-6 pb-5 pt-14">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <p className="font-black text-xs uppercase tracking-widest text-white/30 mr-2">
            Technologies
          </p>

          {TECH_STACK.map((t) => (
            <span
              key={t}
              className="bg-white/5 hover:bg-pink-300 hover:text-black text-white/50 
              text-xs font-black uppercase tracking-widest px-3 py-1.5 transition-colors 
              duration-100 cursor-default"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
