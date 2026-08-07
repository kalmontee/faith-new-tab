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
        'flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-4',
        'transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5',
        active ? 'text-[#d4a547]' : 'text-white/70'
      )}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}
