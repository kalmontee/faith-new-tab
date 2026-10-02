import { useState } from 'react';
import { m } from 'framer-motion';
import { Sprout, Bookmark, Sun, Moon, Settings } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Toggles } from '@/shared/enums/toggles';
import { featureToggle } from '@/shared/feature-flags/flags';

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

function HeaderIconButton({
  onClick,
  label,
  children,
  className,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex items-center justify-center h-9 w-9 rounded-full',
        'text-ink-secondary hover:text-white transition-colors duration-150',
        'hover:bg-white/10',
        className
      )}>
      {children}
    </button>
  );
}

export function DashboardHeader({ onSettingsClick }: DashboardHeaderProps) {
  // Stub — wired up to the theme store once bullet 3 (theme system) is implemented
  const [isDark, setIsDark] = useState(true);

  return (
    <m.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex w-full max-w-[1200px] shrink-0 items-center justify-between px-8 pt-6 pb-2">
      {/* App identity */}
      <div className="flex items-center gap-2.5">
        <Sprout size={20} className="text-gold" aria-hidden />
        <span className="text-sm font-medium text-ink-secondary tracking-wide select-none">New Day. God&apos;s Plan. Better You.</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <HeaderIconButton label="Open settings" onClick={onSettingsClick}>
          <Settings size={20} />
        </HeaderIconButton>

        {featureToggle.isEnabled(Toggles.enabledThemeToggle) && (
          <HeaderIconButton label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDark((d) => !d)}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </HeaderIconButton>
        )}

        <HeaderIconButton label="Bookmark verse">
          <Bookmark size={20} />
        </HeaderIconButton>
      </div>
    </m.header>
  );
}
