import { useState, useRef, useEffect } from 'react';
import { HandHeart, Plus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Card, CardAction, CardHeader } from '@/shared/ui/card';
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
      <CardHeader icon={<HandHeart size={14} />} label="Prayer Requests" tone="rose" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <PrayerSkeleton />}

        {!isLoading && prayers.length === 0 && !isAdding && <p className="text-sm italic text-ink-placeholder">No prayer requests yet.</p>}

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
            'placeholder:text-ink-placeholder caret-[#6bbf7b] border-b border-white/15 pb-1'
          )}
        />
      )}

      {!isLoading && !isAdding && (
        <CardAction onClick={() => setIsAdding(true)} className="mt-3 border-t border-white/10 pt-3">
          <Plus size={14} />
          Add a Request
        </CardAction>
      )}
    </Card>
  );
}
