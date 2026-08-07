import { pickDaily } from '@/shared/lib/daily-rotation';
import { QUOTES } from './quotes-data';
import type { Quote } from './quotes-data';

export function getDailyQuote(date: Date = new Date()): Quote {
  return pickDaily(QUOTES, date);
}
