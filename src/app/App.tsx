import { MotionConfig } from 'framer-motion';
import { Suspense, lazy, useEffect } from 'react';

import Dashboard from './dashboard/Dashboard';
import { DashboardBackground } from './dashboard/DashboardBackground';
import { useViewStore } from '@/shared/store/view-store';

// Code-split so Settings stays out of the New Tab critical bundle.
const importSettingsPage = () => import('./settings/SettingsPage');
const SettingsPage = lazy(importSettingsPage);

export function App() {
  const view = useViewStore((s) => s.view);
  const closeSettings = useViewStore((s) => s.closeSettings);

  // Warm the Settings chunk after first paint so its view transition captures
  // real content on first open instead of suspending into an empty crossfade.
  useEffect(() => {
    void importSettingsPage();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <DashboardBackground>
        {view === 'settings' ? (
          <Suspense fallback={null}>
            <SettingsPage onBack={closeSettings} />
          </Suspense>
        ) : (
          <Dashboard />
        )}
      </DashboardBackground>
    </MotionConfig>
  );
}
