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
      'transition-colors duration-200',
      checked ? 'bg-gold' : 'bg-white/25'
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full shadow',
        checked ? 'bg-[#1a1a1a]' : 'bg-white',
        'transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);
