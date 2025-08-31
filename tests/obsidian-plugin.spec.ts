import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

// Test configuration
const OBSIDIAN_VAULT_PATH = '/Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet';
const PLUGIN_PATH = path.join(__dirname, '../');
const OBSIDIAN_APP_PATH = '/Applications/Obsidian.app/Contents/MacOS/Obsidian';

test.describe('Obsi-Lens Plugin Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Ensure plugin is built
    execSync('npm run build', { cwd: PLUGIN_PATH });
    
    // Create test vault if needed
    // setupTestVault();
  });

  test.beforeEach(async ({ browser }) => {
    // Launch Obsidian with specific vault
    const context = await browser.newContext({
      // Electron app configuration
    });
    page = await context.newPage();
    
    // Navigate to test vault or wait for Obsidian to load
    await page.waitForTimeout(3000); // Wait for Obsidian to fully load
  });

  test('should open image viewer on image click', async () => {
    // 1. Locate an image in the vault
    const imageElement = page.locator('img').first();
    await expect(imageElement).toBeVisible();

    // 2. Click the image
    await imageElement.click();

    // 3. Verify image viewer modal opens
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toBeVisible();

    // 4. Take screenshot for documentation
    await page.screenshot({ 
      path: 'tests/screenshots/image-viewer-open.png',
      fullPage: true 
    });
  });

  test('should zoom and pan image', async () => {
    // Open image viewer first
    await page.locator('img').first().click();
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toBeVisible();

    // Test zoom in with mouse wheel
    const canvas = page.locator('canvas').first();
    await canvas.hover();
    
    // Simulate mouse wheel zoom
    await canvas.mouse.wheel(0, -100); // Zoom in
    
    // Verify zoom level changed (check transform or scale)
    // This would depend on how your plugin implements zoom
    
    // Test pan by dragging
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();

    await page.screenshot({ 
      path: 'tests/screenshots/zoom-pan-test.png' 
    });
  });

  test('should activate drawing mode and draw', async () => {
    // Open image viewer
    await page.locator('img').first().click();
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toBeVisible();

    // Activate drawing mode (assuming there's a draw button)
    const drawButton = page.locator('[data-testid="draw-button"]'); // You'd need to add test IDs
    await drawButton.click();

    // Draw on canvas
    const canvas = page.locator('canvas').first();
    await canvas.hover();
    await page.mouse.down();
    
    // Draw a simple line
    await page.mouse.move(150, 150);
    await page.mouse.move(200, 200);
    await page.mouse.up();

    // Verify drawing appeared (check canvas content or state)
    
    await page.screenshot({ 
      path: 'tests/screenshots/drawing-test.png' 
    });
  });

  test('should respond to keyboard shortcuts', async () => {
    // Open image viewer
    await page.locator('img').first().click();
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toBeVisible();

    // Test rotation with 'R' key
    await page.keyboard.press('r');
    
    // Test navigation with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    
    // Test escape to close
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/keyboard-shortcuts.png' 
    });
  });

  test('should copy image to clipboard', async () => {
    // Open image viewer
    await page.locator('img').first().click();
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toBeVisible();

    // Test copy shortcut
    await page.keyboard.press('Control+c'); // or 'Meta+c' on Mac
    
    // Verify copy operation (this is tricky to test directly)
    // You might need to check internal state or mock clipboard
  });

  test.afterEach(async () => {
    // Close any open modals
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });
});

// Helper function to set up test vault
function setupTestVault() {
  // Create minimal test vault with sample images
  // Copy sample images to test vault
  // Set up basic Obsidian configuration
}

// Helper function to generate demo GIF
test('generate demo gif', async ({ browser }) => {
  const context = await browser.newContext({
    recordVideo: {
      dir: 'tests/videos/',
      size: { width: 1200, height: 800 }
    }
  });
  
  const page = await context.newPage();
  
  // Perform demo sequence
  const imageElement = page.locator('img').first();
  await imageElement.click();
  
  // Wait and interact to show features
  await page.waitForTimeout(1000);
  
  // Zoom
  const canvas = page.locator('canvas').first();
  await canvas.mouse.wheel(0, -200);
  await page.waitForTimeout(1000);
  
  // Draw
  await page.locator('[data-testid="draw-button"]').click();
  await canvas.hover();
  await page.mouse.down();
  await page.mouse.move(200, 200);
  await page.mouse.up();
  
  await page.waitForTimeout(2000);
  await context.close();
  
  // Video will be saved automatically
  // Convert to GIF using external tool if needed
});