import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'New Day',
    description: "New Day. God's Plan. Better You.",
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'notifications'],
    host_permissions: ['http://localhost:3000/*'],
  },
  vite: () => ({
    plugins: [tailwindcss(), yaml()],
  }),
});
