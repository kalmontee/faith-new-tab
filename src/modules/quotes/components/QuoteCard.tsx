import { Quote as QuoteIcon } from 'lucide-react';

import { Card } from '@/shared/ui/card';
import { getDailyQuote } from '../services/quote-service';

export default function QuoteCard() {
  const quote = getDailyQuote();

  return (
    <Card className="justify-center">
      <blockquote className="flex gap-4">
        <span aria-hidden className="w-0.5 shrink-0 self-stretch rounded-full bg-gold/60" />
        <div>
          <QuoteIcon size={16} aria-hidden className="mb-2 text-gold/80" />
          <p className="font-serif text-base leading-relaxed text-white/95">{quote.text}</p>
          <footer className="mt-3 text-xs font-medium text-gold">— {quote.author}</footer>
        </div>
      </blockquote>
    </Card>
  );
}
