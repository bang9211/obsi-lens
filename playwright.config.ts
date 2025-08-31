import { defineConfig, devices } from '@playwright/test';

// Determine Obsidian executable path based on platform
function getObsidianPath() {
  if (process.platform === 'darwin') {
    return '/Applications/Obsidian.app/Contents/MacOS/Obsidian';
  } else if (process.platform === 'linux') {
    return '/usr/bin/obsidian';
  } else if (process.platform === 'win32') {
    return 'C:\\Users\\%USERNAME%\\AppData\\Local\\Obsidian\\Obsidian.exe';
  }
  throw new Error('Unsupported platform');
}

// Get vault path - use test-vault for CI, real vault for local development
const vaultPath = process.env.CI 
  ? `${process.cwd()}/test-vault`
  : '/Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet';

export default defineConfig({
  testDir: './tests',
  fullyParallel: !process.env.CI, // Sequential in CI for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // 60 seconds timeout
  expect: { timeout: 30000 }, // 30 seconds for assertions
  
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github']] : [['list']])
  ],
  
  use: {
    actionTimeout: 15000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Accessibility testing
    colorScheme: 'dark', // Test dark mode by default
  },

  projects: [
    {
      name: 'obsidian-functional-tests',
      testMatch: '**/!(demo-*.spec.ts)',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: getObsidianPath(),
          args: [
            '--enable-logging',
            '--log-level=0',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            ...(process.env.CI ? ['--disable-gpu', '--disable-software-rasterizer'] : []),
            '--vault=' + vaultPath
          ]
        }
      },
    },
    {
      name: 'demo-recording',
      testMatch: '**/demo-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: getObsidianPath(),
          args: [
            '--enable-logging',
            '--log-level=0',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--vault=' + vaultPath
          ]
        },
        // High quality recording for demo generation
        video: {
          mode: 'on',
          size: { width: 1280, height: 800 }
        },
        viewport: { width: 1280, height: 800 }
      }
    },
    // Accessibility testing project
    {
      name: 'accessibility-tests',
      testMatch: '**/accessibility-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: getObsidianPath(),
          args: [
            '--enable-logging',
            '--log-level=0',
            '--force-color-profile=srgb',
            '--disable-background-timer-throttling',
            '--vault=' + vaultPath
          ]
        }
      }
    }
  ],

  // Output directories
  outputDir: 'test-results/',
  
  // Global setup
  globalSetup: require.resolve('./tests/global-setup.ts'),
});