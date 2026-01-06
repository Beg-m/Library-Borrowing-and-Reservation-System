import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for LBRS Backend Testing
 * 
 * This configuration sets up Vitest for backend API unit testing.
 * Uses Node.js environment and excludes frontend code.
 */
export default defineConfig({
  test: {
    // Use Node.js environment (not DOM/browser)
    environment: 'node',
    
    // Glob patterns for test files
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'build'],
    
    // Global setup and teardown
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/seed.js',
        'prisma/',
      ],
    },
    
    // Test timeout (5 seconds)
    testTimeout: 5000,
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
  },
});

