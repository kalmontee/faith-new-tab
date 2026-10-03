import { cn } from '@/shared/lib/utils';
import { glassSurface } from './glass-surface';

export type CardTone = 'gold' | 'green' | 'rose' | 'sky' | 'amber';

const toneClasses: Record<CardTone, string> = {
  gold: 'bg-gold/15 text-gold',
  green: 'bg-green-accent/15 text-green-accent',
  rose: 'bg-rose-accent/15 text-rose-accent',
  sky: 'bg-sky-accent/15 text-sky-accent',
  amber: 'bg-warm-amber/15 text-warm-amber',
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}

interface CardHeaderProps {
  icon: React.ReactNode;
  label: string;
  tone?: CardTone;
  className?: string;
}

interface CardActionProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const Card = ({ children, className, featured }: CardProps) => (
  <div
    className={cn(
      glassSurface,
      'relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-5',
      'transition-[border-color,transform] duration-200',
      'hover:border-white/20 hover:scale-[1.005]',
      featured && 'border-gold/25 hover:border-gold/40',
      className
    )}
  >
    {featured && (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(212,165,71,0.16),transparent_70%)]"
      />
    )}
    {children}
  </div>
);

export const CardHeader = ({ icon, label, tone = 'gold', className }: CardHeaderProps) => (
  <div className={cn('mb-3 flex items-center gap-2.5', className)}>
    <span aria-hidden className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
      {icon}
    </span>
    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-secondary">{label}</span>
  </div>
);

export const CardAction = ({ children, onClick, className }: CardActionProps) => (
  <button
    onClick={onClick}
    className={cn('flex items-center gap-1.5 text-[13px] font-medium text-green-accent transition-colors hover:text-[#84cf91]', className)}
  >
    {children}
  </button>
);
