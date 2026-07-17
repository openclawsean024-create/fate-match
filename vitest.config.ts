import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx'],
      reporter: ['text', 'text-summary', 'json-summary'],
      thresholds: {
        // Global thresholds — only utils tested so far
        // production-ready.sh 在 script 內 parse src/utils 單獨閾值
        // (util ≥ 90%, store ≥ 70%)
        // 此處留低、避免 component 沒測試時 hard fail
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0,
      },
      // exit non-zero when thresholds fail
      passWithNoTests: false,
    },
  },
})