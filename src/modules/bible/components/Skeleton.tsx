export const VerseSkeleton = () => (
  <div className="flex flex-col items-center gap-4 animate-pulse">
    <div className="h-8 w-8 rounded bg-white/10" />
    <div className="space-y-2 text-center w-full">
      <div className="h-4 w-3/4 rounded bg-white/10 mx-auto" />
      <div className="h-4 w-2/3 rounded bg-white/10 mx-auto" />
      <div className="h-4 w-1/2 rounded bg-white/10 mx-auto" />
    </div>
    <div className="h-px w-16 bg-white/10" />
    <div className="h-4 w-24 rounded bg-white/10" />
  </div>
);
