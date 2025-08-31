# Obsidian Plugin Playwright Testing Setup

## Installation & Setup

```bash
# Install Playwright and dependencies
npm install --save-dev @playwright/test
npx playwright install

# Install additional dependencies for Obsidian testing
npm install --save-dev electron
npm install --save-dev fs-extra
npm install --save-dev ffmpeg-static
```

## Test Vault Setup

Create a dedicated test vault with required test data:

```bash
# Create test vault structure
mkdir -p test-vault/.obsidian/plugins/obsi-lens
mkdir -p test-vault/images
mkdir -p test-vault/attachments

# Copy plugin files to test vault
cp main.js manifest.json styles.css test-vault/.obsidian/plugins/obsi-lens/

# Add test images
cp test-images/*.{jpg,png,gif} test-vault/images/

# Create test markdown files
cat > test-vault/test-note.md << 'EOF'
# Test Note for Image Viewer

![Test Image 1](images/test1.jpg)
![Test Image 2](images/test2.png)
![Test GIF](images/animated.gif)

## Multiple Images
- ![Small Image](images/small.jpg)
- ![Large Image](images/large.jpg)
EOF
```

## Test Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'obsidian-electron',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/Applications/Obsidian.app/Contents/MacOS/Obsidian', // macOS path
          args: [
            '--enable-logging', 
            '--log-level=0',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            `--user-data-dir=${process.cwd()}/test-vault`
          ]
        }
      },
    },
  ],
  // Global setup for plugin installation
  globalSetup: require.resolve('./tests/global-setup.ts'),
});
```

## Test Scenarios

### 1. Basic Image Viewer Test
```typescript
// tests/basic-viewer.spec.ts
- Open Obsidian with test vault
- Navigate to test-note.md
- Click on first image to open viewer
- Verify modal opens with correct image
- Test zoom in/out with mouse wheel
- Test pan functionality with drag
- Verify close functionality (ESC key)
```

### 2. Drawing Tools Test
```typescript
// tests/drawing-tools.spec.ts
- Open image viewer modal
- Click drawing tool button
- Select line drawing tool
- Draw lines on canvas
- Verify canvas updates in real-time
- Test undo/redo functionality (Ctrl+Z/Ctrl+Y)
- Test text tool functionality
- Test eraser tool
```

### 3. Keyboard Shortcuts Test
```typescript
// tests/keyboard-shortcuts.spec.ts
- ESC: Close modal
- R: Reset zoom and position
- Arrow keys: Navigate between images
- Space: Toggle drawing mode
- Delete: Clear all drawings
- Ctrl+Z/Y: Undo/Redo
```

### 4. Multi-image Navigation Test
```typescript
// tests/multi-image-nav.spec.ts
- Open first image in test-note.md
- Use arrow keys to navigate to next image
- Verify image changes correctly
- Test navigation wrap-around
- Verify smooth transitions between images
```

### 5. Popout Window Test
```typescript
// tests/popout-window.spec.ts
- Open image viewer
- Click popout button
- Verify new window opens
- Test functionality in popout window
- Verify synchronization between windows
```

## Demo GIF Generation

### Automatic Video Recording
```typescript
// tests/demo-generator.spec.ts
import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test('Generate demo GIF', async ({ page, context }) => {
  // Start video recording
  await context.tracing.start({ screenshots: true, snapshots: true });
  
  // Demo scenario actions
  await page.goto('app://obsidian.md/test-vault');
  await page.click('[data-path="test-note.md"]');
  await page.click('img[src*="test1.jpg"]');
  
  // Wait for image viewer to open
  await page.waitForSelector('.image-viewer-modal');
  
  // Demo drawing functionality
  await page.click('.drawing-tool-btn');
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(400, 400);
  await page.mouse.up();
  
  // Stop recording
  const tracePath = await context.tracing.stop({ path: 'demo-trace.zip' });
  
  // Convert video to GIF
  const videoPath = await page.video()?.path();
  if (videoPath) {
    await execAsync(`ffmpeg -i "${videoPath}" -vf "fps=10,scale=800:-1" demo.gif`);
  }
});
```

### GIF Optimization Settings
```bash
# High quality GIF
ffmpeg -i demo.webm -vf "fps=15,scale=1024:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i demo.webm -i palette.png -vf "fps=15,scale=1024:-1:flags=lanczos,paletteuse" demo-hq.gif

# Compressed GIF for documentation
ffmpeg -i demo.webm -vf "fps=8,scale=640:-1:flags=lanczos,palettegen" palette-sm.png
ffmpeg -i demo.webm -i palette-sm.png -vf "fps=8,scale=640:-1:flags=lanczos,paletteuse" demo-small.gif
```