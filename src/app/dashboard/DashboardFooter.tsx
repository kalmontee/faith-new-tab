import { m } from 'framer-motion';
import { BookOpen, Calendar, Music, Sprout } from 'lucide-react';

import { pickDaily } from '@/shared/lib/daily-rotation';
import { Toggles } from '@/shared/enums/toggles';
import { featureToggle } from '@/shared/feature-flags/flags';
import { FOOTER_VERSES } from './footer-verses';

function FooterIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      disabled
      aria-label={`${label} — coming soon`}
      title="Coming soon"
      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-tertiary cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

export function DashboardFooter() {
  const verse = pickDaily(FOOTER_VERSES);

  return (
    <m.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.4 }}
      style={{ gridArea: 'footer' }}
      className="flex items-center justify-between gap-4 border-t border-white/15 px-1 pt-4 pb-2"
    >
      <div className="flex min-w-0 items-center gap-2">
        <BookOpen size={15} className="shrink-0 text-ink-secondary" aria-hidden />
        <p className="truncate text-[13px] text-ink-secondary [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
          <span className="italic">&ldquo;{verse.text}&rdquo;</span> <span className="font-medium text-gold">{verse.reference}</span>
        </p>
      </div>

      {featureToggle.isEnabled(Toggles.enabledFooterIcons) && (
        <div className="flex shrink-0 items-center gap-1">
          <FooterIconButton label="Calendar">
            <Calendar size={15} />
          </FooterIconButton>
          <FooterIconButton label="Music">
            <Music size={15} />
          </FooterIconButton>
          <FooterIconButton label="Growth">
            <Sprout size={15} />
          </FooterIconButton>
        </div>
      )}
    </m.footer>
  );
}
