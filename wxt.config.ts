import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'New Day',
    description: "New Day. God's Plan. Better You.",
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'notifications'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
