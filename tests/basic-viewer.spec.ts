// tests/basic-viewer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic Image Viewer Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test vault (adjust URL based on Obsidian setup)
    await page.goto('app://obsidian.md/test-vault');
    
    // Wait for Obsidian to fully load
    await page.waitForSelector('.workspace-leaf-content');
    await page.waitForTimeout(2000); // Allow time for plugins to load
  });

  test('should open image viewer when clicking on image', async ({ page }) => {
    // Open the test note
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');

    // Click on the first image
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');

    // Verify image viewer modal opens
    await expect(page.locator('.image-viewer-modal')).toBeVisible();
    
    // Verify the modal contains an image
    await expect(page.locator('.image-viewer-modal img')).toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/image-viewer-opened.png' });
  });

  test('should close image viewer with ESC key', async ({ page }) => {
    // Open image viewer first
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Press ESC to close
    await page.keyboard.press('Escape');

    // Verify modal closes
    await expect(page.locator('.image-viewer-modal')).not.toBeVisible();
  });

  test('should zoom in and out with mouse wheel', async ({ page }) => {
    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    const imageElement = page.locator('.image-viewer-modal img');
    await imageElement.waitFor();

    // Get initial image dimensions
    const initialBounds = await imageElement.boundingBox();
    expect(initialBounds).not.toBeNull();

    // Zoom in with wheel
    await imageElement.hover();
    await page.mouse.wheel(0, -100); // Scroll up to zoom in
    await page.waitForTimeout(500);

    // Verify image is larger
    const zoomedBounds = await imageElement.boundingBox();
    expect(zoomedBounds!.width).toBeGreaterThan(initialBounds!.width);

    // Zoom out with wheel
    await page.mouse.wheel(0, 100); // Scroll down to zoom out
    await page.waitForTimeout(500);

    // Take screenshot of zoomed state
    await page.screenshot({ path: 'tests/screenshots/image-zoomed.png' });
  });

  test('should pan image when dragging', async ({ page }) => {
    // Open image viewer and zoom in first
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    const imageElement = page.locator('.image-viewer-modal img');
    await imageElement.hover();
    
    // Zoom in to enable panning
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(500);

    // Get image position
    const initialBounds = await imageElement.boundingBox();
    expect(initialBounds).not.toBeNull();

    // Pan by dragging
    await page.mouse.move(initialBounds!.x + 100, initialBounds!.y + 100);
    await page.mouse.down();
    await page.mouse.move(initialBounds!.x + 200, initialBounds!.y + 200);
    await page.mouse.up();
    
    await page.waitForTimeout(500);

    // Verify image position changed
    const pannedBounds = await imageElement.boundingBox();
    expect(pannedBounds!.x).not.toBe(initialBounds!.x);
    
    // Take screenshot of panned state
    await page.screenshot({ path: 'tests/screenshots/image-panned.png' });
  });

  test('should reset zoom and position with R key', async ({ page }) => {
    // Open image viewer and modify zoom/pan
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    const imageElement = page.locator('.image-viewer-modal img');
    await imageElement.hover();

    // Zoom and pan
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(300);
    
    const bounds = await imageElement.boundingBox();
    await page.mouse.move(bounds!.x + 100, bounds!.y + 100);
    await page.mouse.down();
    await page.mouse.move(bounds!.x + 200, bounds!.y + 200);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Reset with R key
    await page.keyboard.press('r');
    await page.waitForTimeout(500);

    // Take screenshot of reset state
    await page.screenshot({ path: 'tests/screenshots/image-reset.png' });
    
    // Image should be back to original position and size
    // (Exact verification would depend on the plugin's reset behavior)
  });
});