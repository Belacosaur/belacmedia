import { defineConfig } from 'vitest/config'

/** Vitest does not merge Vite configs exported as callbacks (`defineConfig(({ mode }) => …)`). */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
