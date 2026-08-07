import { useState, useRef, useEffect } from 'react';
import { Church, Plus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Card, CardHeader } from '@/shared/ui/card';
import { usePrayers } from '../hooks/use-prayers';
import { PrayerSkeleton } from './Skeleton';
import { PrayerRow } from './PrayerRow';

export default function PrayerCard() {
  const { prayers, isLoading, addPrayer, toggleAnswered, removePrayer } = usePrayers();
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  function handleSubmit() {
    const text = draft.trim();
    if (text) addPrayer(text);
    setDraft('');
    setIsAdding(false);
  }

  return (
    <Card>
      <CardHeader icon={<Church size={15} className="text-white/50 shrink-0" />} label="Prayer Requests" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <PrayerSkeleton />}

        {!isLoading && prayers.length === 0 && !isAdding && <p className="text-sm text-white/30 italic">No prayer requests yet.</p>}

        {!isLoading && prayers.length > 0 && (
          <ul className="space-y-2.5">
            {prayers.map((prayer) => (
              <PrayerRow
                key={prayer.id}
                prayer={prayer}
                onToggle={() => toggleAnswered(prayer.id)}
                onRemove={() => removePrayer(prayer.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {!isLoading && isAdding && (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setDraft('');
              setIsAdding(false);
            }
          }}
          placeholder="What do you need prayer for?"
          maxLength={140}
          className={cn(
            'mt-3 w-full bg-transparent text-sm text-white/90 focus:outline-none',
            'placeholder:text-white/20 caret-[#6bbf7b] border-b border-white/15 pb-1'
          )}
        />
      )}

      {!isLoading && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className={cn(
            'border-t border-white/15 mt-3 pt-2 flex items-center gap-1.5 text-[13px] font-medium transition-colors',
            'text-[#6bbf7b] hover:text-[#84cf91]'
          )}
        >
          <Plus size={14} />
          Add a Request
        </button>
      )}
    </Card>
  );
}
