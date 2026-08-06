// import { RefreshCw } from 'lucide-react';

interface VerseReferenceProps {
  reference: string;
  translation: string;
  onNewVerse?: () => void;
  isLoading?: boolean;
}

export function VerseReference({ reference, translation }: VerseReferenceProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <hr className="w-16 border-white/15" />

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-medium text-[#d4a547]">{reference}</span>
        <span className="text-[11px] uppercase tracking-widest text-white/40">{translation}</span>
      </div>

      {/* <button
        onClick={onNewVerse}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white disabled:opacity-40">
        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        New Verse
      </button> */}
    </div>
  );
}
