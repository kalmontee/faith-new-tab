import { cn } from '@/shared/lib/utils';

export const glassSurface = cn(
  'border border-white/10 text-white',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%),rgba(12,18,24,0.62)]',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_-12px_rgba(0,0,0,0.35)]',
  'backdrop-blur-xl backdrop-saturate-150'
);
