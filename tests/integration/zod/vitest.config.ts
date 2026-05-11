import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Anchor `include` to this config file's directory; otherwise it resolves
  // against the cwd of the runner (the repo root) and accidentally picks up
  // unrelated tests under `tests/`.
  root: import.meta.dirname,
  test: {
    include: ['tests/**/*.test.ts'],
    globals: true,
    coverage: {
      enabled: false,
    },
  },
});
