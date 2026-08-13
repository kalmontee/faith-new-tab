import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { Check, GripVertical, Pencil, X } from 'lucide-react';

import type { TodoItem } from '@/shared/types/table';
import { cn } from '@/shared/lib/utils';

interface TodoRowProps {
  todo: TodoItem;
  onToggle: () => void;
  onEdit: (text: string) => void;
  onRemove: () => void;
}

export function TodoRow({ todo, onToggle, onEdit, onRemove }: TodoRowProps) {
  const dragControls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);
  // Guards the editor against committing twice — e.g. Enter closes it and the
  // resulting blur would otherwise fire a second commit.
  const editingRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(todo.text);
    editingRef.current = true;
    setIsEditing(true);
  }

  function commitEditing() {
    if (!editingRef.current) return;
    editingRef.current = false;

    const text = draft.trim();
    if (text && text !== todo.text) onEdit(text);
    setIsEditing(false);
  }

  function cancelEditing() {
    if (!editingRef.current) return;
    editingRef.current = false;
    setIsEditing(false);
  }

  return (
    <Reorder.Item
      value={todo}
      dragListener={false}
      dragControls={dragControls}
      className="group flex items-start gap-2 border-b border-white/10 last:border-b-0 pb-2"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Reorder to-do item"
        className={cn(
          'mt-0.5 shrink-0 cursor-grab touch-none text-white/0 transition-colors active:cursor-grabbing',
          'group-hover:text-white/30 hover:!text-white/60'
        )}
      >
        <GripVertical size={14} />
      </button>

      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.8 }}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={todo.completed}
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200',
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

      {isEditing ? (
        <input
          ref={inputRef}
          aria-label="Edit to-do text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEditing();
            if (e.key === 'Escape') cancelEditing();
          }}
          maxLength={140}
          className={cn(
            'flex-1 bg-transparent text-xs leading-snug text-white/90 focus:outline-none',
            'caret-[#6bbf7b] border-b border-white/15 pb-0.5'
          )}
        />
      ) : (
        <p
          className={cn(
            'flex-1 text-xs leading-snug transition-colors duration-200',
            todo.completed ? 'text-white/35 line-through' : 'text-white/90'
          )}
        >
          {todo.text}
        </p>
      )}

      {!isEditing && (
        <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit to-do item"
            className="text-white/0 group-hover:text-white/40 hover:!text-white/80 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove to-do item"
            className="text-white/0 group-hover:text-white/40 hover:!text-white/80 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}
