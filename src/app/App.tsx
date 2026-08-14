import { MotionConfig } from 'framer-motion';

import Dashboard from './dashboard/Dashboard';
import { DashboardBackground } from './dashboard/DashboardBackground';

// Persistent app shell. The background lives here — not inside a view — so it
// stays mounted across view changes and never flashes when the content swaps.
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <DashboardBackground>
        <Dashboard />
      </DashboardBackground>
    </MotionConfig>
  );
}