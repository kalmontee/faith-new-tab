import { MotionConfig } from 'framer-motion';

import { DashboardBackground } from './DashboardBackground';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { ModuleRenderer } from './ModuleRenderer';

export default function Dashboard() {
  function openSettings() {
    window.location.href = chrome.runtime.getURL('settings.html');
  }

  return (
    <MotionConfig reducedMotion="user">
      <DashboardBackground>
        <DashboardHeader onSettingsClick={openSettings} />
        <div className="dashboard-grid flex-1">
          <ModuleRenderer />
          <DashboardFooter />
        </div>
      </DashboardBackground>
    </MotionConfig>
  );
}
