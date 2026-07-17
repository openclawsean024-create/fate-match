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
        // Production-Ready Checklist v0.2 B2 門檻
        'src/utils/**': {
          lines: 90,
          functions: 90,
          branches: 80,
          statements: 90,
        },
        'src/store/**': {
          lines: 70,
          functions: 70,
          branches: 60,
          statements: 70,
        },
      },
    },
  },
})