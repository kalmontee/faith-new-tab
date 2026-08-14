import { Fragment } from 'react';

import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { ModuleRenderer } from './ModuleRenderer';

// Background and motion config live in the app shell (see App.tsx); this view
// renders only its own content.
export default function Dashboard() {
  function openSettings() {
    window.location.href = chrome.runtime.getURL('settings.html');
  }

  return (
    <Fragment>
      <DashboardHeader onSettingsClick={openSettings} />
      <div className="dashboard-grid flex-1">
        <ModuleRenderer />
        <DashboardFooter />
      </div>
    </Fragment>
  );
}
