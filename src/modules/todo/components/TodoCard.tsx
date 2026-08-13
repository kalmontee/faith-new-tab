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
        <CardHeader icon={<ListTodo size={15} className="text-white/50 shrink-0" />} label="To-Do List" className="mb-0" />
        <button
          onClick={() => setIsAdding(true)}
          aria-label="Add a to-do item"
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/8 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {isLoading && <TodoSkeleton />}

        {!isLoading && todos.length === 0 && !isAdding && <p className="text-sm text-white/30 italic">Nothing on your list yet.</p>}

        {!isLoading && todos.length > 0 && (
          <Reorder.Group axis="y" values={todos} onReorder={reorderTodos} className="space-y-2.5">
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
            'placeholder:text-white/20 caret-[#6bbf7b] border-b border-white/15 pb-1'
          )}
        />
      )}
    </Card>
  );
}
