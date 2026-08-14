import { defineConfig } from 'vitest/config';
import yaml from '@modyfi/vite-plugin-yaml';
import path from 'path';

export default defineConfig({
  // Mirror the YAML plugin from wxt.config.ts so `.yaml` imports (e.g. the
  // feature-flags app-config) resolve in tests the same way they do in the build.
  plugins: [yaml()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      exclude: [
        '**/*.test.*',
        '**/*.d.ts',
        '**/index.ts', // barrel re-exports
        '**/types.ts',
        'src/modules/quotes/services/quotes-data.ts', // static data, not logic
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
