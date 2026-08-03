import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Bookmark, Sun, Moon, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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
        'flex items-center justify-center h-8 w-8 rounded-full',
        'text-white/50 hover:text-white transition-colors duration-150',
        'hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#d4a547] focus-visible:ring-offset-transparent',
        className
      )}
    >
      {children}
    </button>
  );
}

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

export function DashboardHeader({ onSettingsClick }: DashboardHeaderProps) {
  // Stub — wired up to the theme store once bullet 3 (theme system) is implemented
  const [isDark, setIsDark] = useState(true);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-10 py-6 mb-2 w-full shrink-0"
    >
      {/* App identity */}
      <div className="flex items-center gap-2.5">
        <Sprout size={20} className="text-[#d4a547]" aria-hidden />
        <span className="text-sm font-medium text-white/55 tracking-wide select-none">New Day. God&apos;s Plan. Better You.</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5">
        <HeaderIconButton label="Open settings" onClick={onSettingsClick}>
          <Settings size={20} />
        </HeaderIconButton>

        <HeaderIconButton label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDark((d) => !d)}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </HeaderIconButton>

        <HeaderIconButton label="Bookmark verse">
          <Bookmark size={20} />
        </HeaderIconButton>
      </div>
    </motion.header>
  );
}
