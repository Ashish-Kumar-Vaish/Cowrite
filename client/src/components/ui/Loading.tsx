export function Loading({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 justify-center mb-4 ${fullScreen ? "min-h-screen" : "min-h-[40vh]"}`}
    >
      <span className="w-4 h-8 bg-black rounded-sm animate-bounce [animation-delay:0ms] [animation-duration:0.8s]" />
      <span className="w-4 h-8 bg-yellow-300 rounded-sm animate-bounce [animation-delay:150ms] [animation-duration:0.8s]" />
      <span className="w-4 h-8 bg-black rounded-sm animate-bounce [animation-delay:300ms] [animation-duration:0.8s]" />
    </div>
  );
}
