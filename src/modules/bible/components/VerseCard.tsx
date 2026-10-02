import { Card } from '@/shared/ui/card';
import { useDailyVerse } from '../hooks/use-daily-verse';
import { VerseReference } from './VerseReference';
import { VerseSkeleton } from './Skeleton';

export default function VerseCard() {
  const { data: verse, isLoading, isError } = useDailyVerse();

  return (
    <Card featured className="items-center justify-center">
      {/* px-8 py-8 */}
      {isLoading && <VerseSkeleton />}

      {isError && !verse && <div className="text-center text-sm text-ink-secondary">Could not load verse. Check your connection.</div>}

      {verse && (
        <div className="relative flex flex-col items-center gap-5 px-2">
          <span className="font-serif text-6xl leading-none text-gold/80 select-none">&ldquo;</span>

          <p className="font-serif text-center text-[1.45rem] leading-[1.6] text-white text-balance">{verse.text}</p>

          <VerseReference reference={verse.reference} translation={verse.translation} />
        </div>
      )}
    </Card>
  );
}
