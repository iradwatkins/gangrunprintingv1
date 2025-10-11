/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    reporters: ['verbose'],
    // Include only test files, exclude Playwright spec files
    include: ['**/*.test.{ts,tsx,js,jsx}'],
    exclude: [
      'node_modules/**',
      'playwright-tests/**',
      '**/*.spec.{ts,tsx,js,jsx}',
      '.next/**',
      'dist/**',
      'build/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'coverage/',
        'playwright-report/',
        '**/*.d.ts',
        '**/*.config.*',
        'prisma/',
        'public/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
