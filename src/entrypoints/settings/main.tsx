import React from 'react';
import ReactDOM from 'react-dom/client';

import SettingsPage from '@/app/settings/SettingsPage';
import '@/styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsPage />
  </React.StrictMode>
);
