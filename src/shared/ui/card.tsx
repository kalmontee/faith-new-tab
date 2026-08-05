import { cn } from '@/shared/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <div
    className={cn(
      'flex h-full w-full flex-col rounded-2xl border border-white/8 bg-[rgba(15,20,25,0.55)] p-5 text-white',
      'backdrop-blur-xl transition-[border-color,transform] duration-200',
      'hover:border-white/15 hover:scale-[1.005]',
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({ icon, label, className }: CardHeaderProps) => (
  <div className={cn('mb-3 flex items-center gap-2', className)}>
    <span>{icon}</span>
    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">{label}</span>
  </div>
);
