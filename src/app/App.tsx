import { MotionConfig } from 'framer-motion';
import { Suspense, lazy } from 'react';

import Dashboard from './dashboard/Dashboard';
import { DashboardBackground } from './dashboard/DashboardBackground';
import { useViewStore } from '@/shared/store/view-store';

// Code-split so Settings stays out of the New Tab critical bundle.
const SettingsPage = lazy(() => import('./settings/SettingsPage'));

export function App() {
  const view = useViewStore((s) => s.view);
  const closeSettings = useViewStore((s) => s.closeSettings);

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
