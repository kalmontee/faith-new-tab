import { useState, useRef, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { ListTodo, Plus } from 'lucide-react';

import { useTodos } from '../hooks/use-todos';
import { Card, CardHeader } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { TodoRow } from './TodoRow';
import { TodoSkeleton } from './Skeleton';

export default function TodoCard() {
  const { todos, isLoading, addTodo, editTodo, toggleTodo, removeTodo, reorderTodos } = useTodos();
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  function handleSubmit() {
    const text = draft.trim();
    if (text) addTodo(text);
    setDraft('');
    setIsAdding(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader icon={<ListTodo size={14} />} label="To-Do List" tone="green" className="mb-0" />
        <button
          onClick={() => setIsAdding(true)}
          aria-label="Add a to-do item"
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-secondary hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {isLoading && <TodoSkeleton />}

        {!isLoading && todos.length === 0 && !isAdding && <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2.5 text-left text-sm text-ink-secondary transition-colors hover:border-green-accent/50 hover:text-white"
          >
            <Plus size={14} aria-hidden className="shrink-0" />
            Add your first task
          </button>}

        {!isLoading && todos.length > 0 && (
          <Reorder.Group axis="y" values={todos} onReorder={(next) => void reorderTodos(next).catch(() => {})} className="space-y-2.5">
            {todos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={() => void toggleTodo(todo.id).catch(() => {})}
                onEdit={(text) => void editTodo(todo.id, text).catch(() => {})}
                onRemove={() => void removeTodo(todo.id).catch(() => {})}
              />
            ))}
          </Reorder.Group>
        )}
      </div>

      {!isLoading && isAdding && (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setDraft('');
              setIsAdding(false);
            }
          }}
          placeholder="Add a to-do..."
          maxLength={140}
          className={cn(
            'mt-3 w-full bg-transparent text-sm text-white/90 focus:outline-none',
            'placeholder:text-ink-placeholder caret-[#6bbf7b] border-b border-white/15 pb-1'
          )}
        />
      )}
    </Card>
  );
}
