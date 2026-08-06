import { useState, useEffect, useRef, Fragment } from 'react';
import { Heart } from 'lucide-react';

import { Card, CardHeader } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useTodayGratitude } from '../hooks/use-today-gratitude';
import { GratitudeSkeleton } from './Skeleton';

export default function GratitudeCard() {
  const { entry, isLoading, save } = useTodayGratitude();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setDraft(entry?.entry ?? '');
    setIsEditing(true);
  }

  function handleSave() {
    save(draft.trim());
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  return (
    <Card>
      <CardHeader icon={<Heart size={15} className="text-white/50 shrink-0" />} label="Today's Gratitude" />

      {isLoading && <GratitudeSkeleton />}

      {!isLoading && !isEditing && (
        <Fragment>
          <button onClick={startEditing} className="w-full text-left" aria-label="Edit today's gratitude">
            {entry?.entry ? (
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{entry.entry}</p>
            ) : (
              <p className="text-sm text-white/30 italic">What are you grateful for today?</p>
            )}
          </button>
          <div className="mt-auto pt-2 flex border-t border-white/15">
            <button onClick={startEditing} className="text-[13px] font-medium text-[#6bbf7b] hover:text-[#84cf91] transition-colors">
              Edit
            </button>
          </div>
        </Fragment>
      )}

      {!isLoading && isEditing && (
        <div
          className="mt-3"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              handleSave();
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="What are you grateful for today?"
            maxLength={280}
            rows={3}
            className={cn(
              'w-full resize-none bg-transparent focus:outline-none',
              'text-sm text-white/90 leading-relaxed placeholder:text-white/20 caret-[#d4a547]',
              'border-b border-white/15 pb-1'
            )}
          />
          <p className="text-[10px] text-white/20 pt-1.5">Click away to save · Esc to cancel</p>
        </div>
      )}
    </Card>
  );
}
