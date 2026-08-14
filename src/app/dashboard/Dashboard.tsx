import { Fragment } from 'react';

import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { ModuleRenderer } from './ModuleRenderer';
import { useViewStore } from '@/shared/store/view-store';

export default function Dashboard() {
  const openSettings = useViewStore((s) => s.openSettings);

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
