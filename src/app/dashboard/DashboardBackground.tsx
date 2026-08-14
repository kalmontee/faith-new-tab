import { useSettingsStore } from '@/shared/store/settings-store';
import { getBackgroundStyle } from '@/shared/types/background';

interface DashboardBackgroundProps {
  children: React.ReactNode;
}

export function DashboardBackground({ children }: DashboardBackgroundProps) {
  const backgroundId = useSettingsStore((s) => s.backgroundId);
  const solidColor = useSettingsStore((s) => s.backgroundSolidColor);
  const background = getBackgroundStyle(backgroundId, solidColor);

  return (
    <div data-app-background className="relative min-h-screen w-full overflow-hidden" style={{ background }}>
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="relative z-10 flex min-h-screen w-full flex-col">{children}</div>
    </div>
  );
}
