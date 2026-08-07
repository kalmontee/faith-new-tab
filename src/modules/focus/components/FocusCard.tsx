import { useState, useEffect, useRef } from 'react';
import { Pencil, Sparkle } from 'lucide-react';

import { Card, CardHeader } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { pickDaily } from '@/shared/lib/daily-rotation';
import { useTodayFocus } from '../hooks/use-today-focus';
import { FocusSkeleton } from './Skeleton';

const DAILY_LINES = [
  'Trust. Pray. Keep Going.',
  'He is faithful. Stay the course.',
  'Walk by faith, not by sight.',
  'Be still and know that He is God.',
  'With God, all things are possible.',
  'His grace is sufficient.',
  'Press on toward the goal.',
  'Seek first the Kingdom.',
  'Cast your cares upon Him.',
  'Do everything in love.',
  'Let your light shine.',
  'Be strong and courageous.',
  'Fix your eyes on what is true.',
  'You are more than a conqueror.',
  'He who began a good work will complete it.',
  'Count it all joy.',
  'Delight yourself in the Lord.',
  'Your strength is renewed.',
  'Hope does not put us to shame.',
  'Give thanks in all circumstances.',
  'Peace that surpasses all understanding.',
  'He makes all things new.',
];

const inputClass = cn('w-full bg-transparent focus:outline-none', 'placeholder:text-white/20 caret-[#d4a547]');

export default function FocusCard() {
  const { entry, isLoading, save } = useTodayFocus();
  const [isEditing, setIsEditing] = useState(false);
  const [draftFocus, setDraftFocus] = useState('');
  const [draftTagline, setDraftTagline] = useState('');
  const focusRef = useRef<HTMLInputElement>(null);
  const dailyLine = pickDaily(DAILY_LINES);

  function startEditing() {
    setDraftFocus(entry?.focus ?? '');
    setDraftTagline(entry?.tagline ?? '');
    setIsEditing(true);
  }

  function handleSave() {
    save(draftFocus.trim(), draftTagline.trim());
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  // Auto-focus the first input when entering edit mode
  useEffect(() => {
    if (isEditing) focusRef.current?.focus();
  }, [isEditing]);

  return (
    <Card>
      <CardHeader icon={<Sparkle size={15} className="text-white/50 shrink-0" />} label="Today's Focus" />

      {isLoading && <FocusSkeleton />}

      {!isLoading && !isEditing && (
        <button onClick={startEditing} className="group w-full text-left mt-3 space-y-1" aria-label="Edit today's focus">
          {entry?.focus ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-white leading-snug">{entry.focus}</p>
                <Pencil size={13} className="mt-0.5 shrink-0 text-white/0 group-hover:text-white/30 transition-colors" />
              </div>
              {entry.tagline && <p className="text-xs text-white/50">{entry.tagline}</p>}
            </>
          ) : (
            <p className="text-sm text-white/30 italic">Set your focus for today...</p>
          )}
        </button>
      )}

      {!isLoading && isEditing && (
        // Container-level blur: save when focus leaves both inputs entirely
        <div
          className="mt-3 space-y-2"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              handleSave();
            }
          }}
        >
          <input
            ref={focusRef}
            value={draftFocus}
            onChange={(e) => setDraftFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (next) next.focus();
                else handleSave();
              }
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="What's your focus today?"
            maxLength={120}
            className={cn(inputClass, 'text-sm font-medium text-white border-b border-white/15 pb-1')}
          />
          <input
            value={draftTagline}
            onChange={(e) => setDraftTagline(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="Short tagline... (optional)"
            maxLength={80}
            className={cn(inputClass, 'text-xs text-white/60 border-b border-white/8 pb-1')}
          />
          <p className="text-[10px] text-white/20 pt-0.5">Enter to save · Esc to cancel</p>
        </div>
      )}

      {/* Daily one-liner */}
      <div className="mt-auto pt-2 border-t border-white/15">
        <p className="text-[13px] font-medium text-[#6bbf7b]">
          <span aria-hidden>🌿 </span>
          {dailyLine}
        </p>
      </div>
    </Card>
  );
}
