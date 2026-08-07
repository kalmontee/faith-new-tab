import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { PrayerRequest } from '@/shared/types/table';

export function PrayerRow({ prayer, onToggle, onRemove }: { prayer: PrayerRequest; onToggle: () => void; onRemove: () => void }) {
  return (
    <li className="group flex items-start gap-2.5">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.8 }}
        aria-label={prayer.answered ? 'Mark as unanswered' : 'Mark as answered'}
        aria-pressed={prayer.answered}
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center transition-colors"
      >
        <AnimatePresence mode="wait">
          {prayer.answered ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <Check size={14} strokeWidth={2.5} className="text-[#6bbf7b]" />
            </motion.span>
          ) : (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <span className="block h-1.5 w-1.5 rounded-full bg-white/60" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p
        className={cn(
          'flex-1 text-sm leading-snug transition-colors duration-200',
          prayer.answered ? 'text-white/35 line-through' : 'text-white/90'
        )}
      >
        {prayer.text}
      </p>

      <button
        onClick={onRemove}
        aria-label="Remove prayer request"
        className="mt-0.5 shrink-0 text-white/0 group-hover:text-white/40 hover:!text-white/80 transition-colors"
      >
        <X size={14} />
      </button>
    </li>
  );
}
