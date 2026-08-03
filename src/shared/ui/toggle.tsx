import { cn } from '@/shared/lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle = ({ checked, onCheckedChange, label }: ToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
      'transition-colors duration-200 focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-[#d4a547] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
      checked ? 'bg-[#d4a547]' : 'bg-white/20'
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow',
        'transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);
