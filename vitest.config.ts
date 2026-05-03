import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/?(*.)+(spec|test).?(c|m)[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', 'tests/**'],
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'clover', 'json'],
      reportsDirectory: 'coverage',
    },
  },
});
