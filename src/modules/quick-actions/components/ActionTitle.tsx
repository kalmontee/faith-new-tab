import { cn } from '@/shared/lib/utils';

export function ActionTile({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.06] px-3 py-4',
        'transition-colors hover:border-white/15 hover:bg-white/12 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/5 disabled:hover:bg-white/[0.06]',
        active ? 'text-gold' : 'text-white/80'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
