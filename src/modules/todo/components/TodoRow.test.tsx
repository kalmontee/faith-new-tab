import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Reorder } from 'framer-motion';

import { TodoRow } from './TodoRow';
import type { TodoItem } from '@/shared/types/table';

const baseTodo: TodoItem = { id: 1, text: 'Read Psalm 23', completed: false, createdAt: 1_000, position: 0 };

// TodoRow is a Reorder.Item, so it must render inside a Reorder.Group context.
function renderRow(overrides: Partial<TodoItem> = {}) {
  const todo = { ...baseTodo, ...overrides };
  const onToggle = vi.fn();
  const onEdit = vi.fn();
  const onRemove = vi.fn();

  render(
    <Reorder.Group axis="y" values={[todo]} onReorder={() => {}}>
      <TodoRow todo={todo} onToggle={onToggle} onEdit={onEdit} onRemove={onRemove} />
    </Reorder.Group>
  );

  return { onToggle, onEdit, onRemove };
}

function openEditor() {
  fireEvent.click(screen.getByRole('button', { name: /edit to-do/i }));
  return screen.getByRole('textbox', { name: /edit to-do/i }) as HTMLInputElement;
}

describe('TodoRow', () => {
  it('should render the todo text', () => {
    renderRow();
    expect(screen.getByText('Read Psalm 23')).toBeTruthy();
  });

  it('should call onToggle when the checkbox is clicked', () => {
    const { onToggle } = renderRow();
    fireEvent.click(screen.getByRole('button', { name: /mark as complete/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onRemove when the remove button is clicked', () => {
    const { onRemove } = renderRow();
    fireEvent.click(screen.getByRole('button', { name: /remove to-do/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should open an editor seeded with the current text', () => {
    renderRow();
    const input = openEditor();
    expect(input.value).toBe('Read Psalm 23');
  });

  it('should save the edited text on Enter', () => {
    const { onEdit } = renderRow();
    const input = openEditor();

    fireEvent.change(input, { target: { value: 'Read Psalm 23 aloud' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onEdit).toHaveBeenCalledWith('Read Psalm 23 aloud');
    // Editor closes after saving.
    expect(screen.queryByRole('textbox', { name: /edit to-do/i })).toBeNull();
  });

  it('should save the edited text on blur', () => {
    const { onEdit } = renderRow();
    const input = openEditor();

    fireEvent.change(input, { target: { value: 'Reflect on Psalm 23' } });
    fireEvent.blur(input);

    expect(onEdit).toHaveBeenCalledWith('Reflect on Psalm 23');
  });

  it('should cancel editing on Escape without saving', () => {
    const { onEdit } = renderRow();
    const input = openEditor();

    fireEvent.change(input, { target: { value: 'Discarded change' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: /edit to-do/i })).toBeNull();
  });

  it('should not save when the text is unchanged', () => {
    const { onEdit } = renderRow();
    const input = openEditor();

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('should not save when the text is emptied', () => {
    const { onEdit } = renderRow();
    const input = openEditor();

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onEdit).not.toHaveBeenCalled();
  });
});
