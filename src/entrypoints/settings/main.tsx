import React from 'react';
import ReactDOM from 'react-dom/client';

import SettingsPage from '@/app/settings/SettingsPage';
import { DashboardBackground } from '@/app/dashboard/DashboardBackground';
import '@/styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardBackground>
      <SettingsPage onBack={() => window.history.back()} />
    </DashboardBackground>
  </React.StrictMode>
);
