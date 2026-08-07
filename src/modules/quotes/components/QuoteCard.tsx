import { Card } from '@/shared/ui/card';
import { getDailyQuote } from '../services/quote-service';

export default function QuoteCard() {
  const quote = getDailyQuote();

  return (
    <Card className="justify-end">
      <blockquote>
        <p className="font-serif text-[15px] leading-relaxed text-white/90">&ldquo;{quote.text}&rdquo;</p>
        <footer className="mt-3 text-xs font-medium text-[#d4a547]">— {quote.author}</footer>
      </blockquote>
    </Card>
  );
}
