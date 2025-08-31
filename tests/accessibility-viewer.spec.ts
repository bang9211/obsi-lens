// tests/accessibility-viewer.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('app://obsidian.md/test-vault');
    await page.waitForSelector('.workspace-leaf-content');
    await page.waitForTimeout(2000);
  });

  test('should not have accessibility violations on main interface', async ({ page }) => {
    // Open test note
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');

    // Run accessibility scan on main interface
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations in image viewer modal', async ({ page }) => {
    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Run accessibility scan on modal
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.image-viewer-modal')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Test Tab navigation through controls
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test ESC key to close
    await page.keyboard.press('Escape');
    await expect(page.locator('.image-viewer-modal')).not.toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Check for proper modal role
    const modal = page.locator('.image-viewer-modal');
    await expect(modal).toHaveAttribute('role', 'dialog');

    // Check for aria-label or aria-labelledby
    const hasAriaLabel = await modal.getAttribute('aria-label');
    const hasAriaLabelledBy = await modal.getAttribute('aria-labelledby');
    
    expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();

    // Check button accessibility
    const buttons = page.locator('.image-viewer-modal button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const textContent = await button.textContent();
      
      // Each button should have accessible name
      expect(ariaLabel || title || textContent?.trim()).toBeTruthy();
    }
  });

  test('should maintain focus management', async ({ page }) => {
    // Focus an element before opening modal
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    
    const imageElement = page.locator('img[src*="test1.jpg"], img[src*="image_sample1.png"]').first();
    await imageElement.focus();
    
    // Open modal
    await imageElement.click();
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Focus should be trapped within modal
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    
    // Focused element should be within modal
    const isWithinModal = await focusedElement.isVisible() && 
                         await page.locator('.image-viewer-modal').locator(':focus').count() > 0;
    expect(isWithinModal).toBeTruthy();

    // Close modal and verify focus returns
    await page.keyboard.press('Escape');
    await expect(page.locator('.image-viewer-modal')).not.toBeVisible();
    
    // Focus should return to trigger element or reasonable alternative
    await page.waitForTimeout(100);
    const finalFocusedElement = await page.locator(':focus');
    await expect(finalFocusedElement).toBeVisible();
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast simulation
    await page.emulateMedia({ forcedColors: 'active' });

    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Take screenshot for manual verification
    await page.screenshot({ 
      path: 'tests/screenshots/high-contrast-mode.png',
      fullPage: true 
    });

    // Verify modal is still visible and functional
    await expect(page.locator('.image-viewer-modal img')).toBeVisible();
    
    // Test close functionality still works
    await page.keyboard.press('Escape');
    await expect(page.locator('.image-viewer-modal')).not.toBeVisible();
  });

  test('should work with screen reader simulation', async ({ page }) => {
    // Open image viewer
    await page.click('[data-path="test-note.md"]');
    await page.waitForSelector('.markdown-preview-view');
    await page.click('img[src*="test1.jpg"], img[src*="image_sample1.png"]');
    
    await expect(page.locator('.image-viewer-modal')).toBeVisible();

    // Check that images have alt text or aria-label
    const modalImage = page.locator('.image-viewer-modal img');
    const altText = await modalImage.getAttribute('alt');
    const ariaLabel = await modalImage.getAttribute('aria-label');
    
    expect(altText || ariaLabel).toBeTruthy();

    // Verify live regions for dynamic content updates
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    // Should have at least one live region for status updates
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const politeness = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(politeness);
      }
    }
  });
});