import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import type { TodoItem } from '@/shared/types/table';
import { cn } from '@/shared/lib/utils';

export function TodoRow({ todo, onToggle, onRemove }: { todo: TodoItem; onToggle: () => void; onRemove: () => void }) {
  return (
    <li className="group flex items-start gap-2.5 border-b border-white/10 last:border-b-0 pb-2">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.8 }}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={todo.completed}
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200',
          todo.completed ? 'border-[#6bbf7b] bg-[#6bbf7b]' : 'border-white/25 hover:border-white/50'
        )}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <Check size={11} strokeWidth={3} className="text-[#0f1419]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p
        className={cn(
          'flex-1 text-xs leading-snug transition-colors duration-200',
          todo.completed ? 'text-white/35 line-through' : 'text-white/90'
        )}
      >
        {todo.text}
      </p>
      <button
        onClick={onRemove}
        aria-label="Remove to-do item"
        className="mt-0.5 shrink-0 text-white/0 group-hover:text-white/40 hover:!text-white/80 transition-colors"
      >
        <X size={14} />
      </button>
    </li>
  );
}
