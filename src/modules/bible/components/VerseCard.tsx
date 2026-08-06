import { Card } from '@/shared/ui/card';
import { useDailyVerse } from '../hooks/use-daily-verse';
import { VerseReference } from './VerseReference';
import { VerseSkeleton } from './Skeleton';

export default function VerseCard() {
  const { data: verse, isLoading, isError } = useDailyVerse();

  return (
    <Card className="items-center justify-center">
      {/* px-8 py-8 */}
      {isLoading && <VerseSkeleton />}

      {isError && !verse && <div className="text-center text-sm text-white/50">Could not load verse. Check your connection.</div>}

      {verse && (
        <div className="flex flex-col items-center gap-5">
          <span className="font-serif text-5xl leading-none text-[#d4a547]/80 select-none">&ldquo;</span>

          <p className="font-serif text-center text-[1.35rem] leading-relaxed text-white">{verse.text}</p>

          <VerseReference reference={verse.reference} translation={verse.translation} />
        </div>
      )}
    </Card>
  );
}
