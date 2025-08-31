import { test, expect, Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Real vault configuration
const VAULT_PATH = '/Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet';
const TEST_IMAGES = [
  'attachments/Pasted image 20250901025020.png',
  'attachments/Pasted image 20250829175522.png',
  'Creative/attachments/Pasted image 20240821133922.png'
];

test.describe('Obsi-Lens Demo Recording', () => {
  
  test('record full feature demo', async ({ page }) => {
    // Wait for Obsidian to fully load
    await page.waitForTimeout(5000);

    // Take initial screenshot
    await page.screenshot({ 
      path: 'demos/obsidian-startup.png',
      fullPage: true 
    });

    // Navigate to a note with images
    // Look for file explorer or search for attachments folder
    const fileExplorer = page.locator('.nav-files-container, .file-explorer');
    await expect(fileExplorer).toBeVisible({ timeout: 10000 });

    // Try to navigate to attachments folder
    const attachmentsFolder = page.locator('text=attachments').first();
    if (await attachmentsFolder.isVisible()) {
      await attachmentsFolder.click();
      await page.waitForTimeout(1000);
    }

    // Look for any image in the workspace
    const imageElement = page.locator('img, .image-embed').first();
    await expect(imageElement).toBeVisible({ timeout: 15000 });

    console.log('📸 Found image element, clicking...');
    
    // Click the image to open viewer
    await imageElement.click();
    await page.waitForTimeout(2000);

    // Check if image viewer modal opened
    const modal = page.locator('.modal, .image-viewer-modal, .obsi-lens-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.screenshot({ 
      path: 'demos/image-viewer-opened.png',
      fullPage: true 
    });

    console.log('🖼️ Image viewer opened successfully');

    // Demonstrate zoom functionality
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      console.log('🔍 Testing zoom functionality...');
      
      // Zoom in with mouse wheel
      await canvas.hover();
      await canvas.mouse.wheel(0, -300);
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: 'demos/zoom-in-demo.png' 
      });

      // Pan the image
      await canvas.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: 'demos/pan-demo.png' 
      });
    }

    // Test drawing functionality if available
    const drawButton = page.locator('[title*="draw"], [aria-label*="draw"], .draw-button').first();
    if (await drawButton.isVisible()) {
      console.log('✏️ Testing drawing functionality...');
      
      await drawButton.click();
      await page.waitForTimeout(500);

      // Draw a simple line
      const drawingArea = canvas.or(page.locator('.drawing-canvas')).first();
      await drawingArea.hover();
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.move(300, 250);
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'demos/drawing-demo.png' 
      });
    }

    // Test keyboard shortcuts
    console.log('⌨️ Testing keyboard shortcuts...');
    
    // Test rotation with R key
    await page.keyboard.press('r');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'demos/rotation-demo.png' 
    });

    // Test navigation with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1000);

    // Final demo screenshot
    await page.screenshot({ 
      path: 'demos/final-demo-state.png',
      fullPage: true 
    });

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('🎉 Demo recording completed successfully!');
  });

  test('generate demo GIF', async ({ page, context }) => {
    console.log('🎬 Starting GIF demo recording...');
    
    // Enable video recording
    await context.tracing.start({ 
      screenshots: true, 
      snapshots: true,
      sources: true 
    });

    await page.waitForTimeout(3000);

    // Find and click image with slower, more visible actions
    const imageElement = page.locator('img, .image-embed').first();
    await expect(imageElement).toBeVisible({ timeout: 10000 });
    
    // Highlight the image before clicking
    await imageElement.hover();
    await page.waitForTimeout(1000);
    await imageElement.click();

    // Wait for modal with animation
    const modal = page.locator('.modal, .image-viewer-modal, .obsi-lens-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1500); // Allow modal animation to complete

    console.log('✅ Image viewer opened');

    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      console.log('🔍 Demonstrating zoom...');
      
      // Zoom in with mouse wheel (slower for better GIF)
      await canvas.hover();
      await page.waitForTimeout(500);
      await canvas.mouse.wheel(0, -150);
      await page.waitForTimeout(1200);
      
      await canvas.mouse.wheel(0, -150);
      await page.waitForTimeout(1200);

      console.log('🖱️ Demonstrating pan...');
      
      // Pan the image (slower movements)
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(100, 50, { steps: 20 }); // Smooth movement
      await page.waitForTimeout(200);
      await page.mouse.move(150, 100, { steps: 20 });
      await page.mouse.up();
      await page.waitForTimeout(1000);

      console.log('🔄 Demonstrating reset...');
      
      // Reset with R key
      await page.keyboard.press('r');
      await page.waitForTimeout(1500);
    }

    // Test drawing if available
    const drawButton = page.locator('[title*="draw"], [aria-label*="draw"], .draw-button, [data-tooltip*="draw"]').first();
    if (await drawButton.isVisible()) {
      console.log('✏️ Demonstrating drawing...');
      
      await drawButton.click();
      await page.waitForTimeout(800);

      const drawingArea = canvas.or(page.locator('.drawing-canvas')).first();
      if (await drawingArea.isVisible()) {
        // Draw a simple shape
        await drawingArea.hover();
        await page.mouse.down();
        await page.mouse.move(250, 200, { steps: 15 });
        await page.mouse.move(350, 250, { steps: 15 });
        await page.mouse.move(300, 300, { steps: 15 });
        await page.mouse.up();
        await page.waitForTimeout(1000);
      }
    }

    console.log('🏁 Finishing demo...');

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Stop tracing
    await context.tracing.stop({ path: 'demos/demo-trace.zip' });

    // Get video path and convert to GIF
    const videoPath = await page.video()?.path();
    if (videoPath) {
      console.log(`🎥 Video recorded: ${videoPath}`);
      
      try {
        // Generate high-quality GIF
        await execAsync(`ffmpeg -i "${videoPath}" -vf "fps=12,scale=1024:-1:flags=lanczos,palettegen=reserve_transparent=0" demos/palette.png`);
        await execAsync(`ffmpeg -i "${videoPath}" -i demos/palette.png -vf "fps=12,scale=1024:-1:flags=lanczos,paletteuse=dither=bayer:bayer_scale=3" demos/obsi-lens-demo.gif`);
        
        // Generate smaller GIF for README
        await execAsync(`ffmpeg -i "${videoPath}" -vf "fps=8,scale=640:-1:flags=lanczos,palettegen=reserve_transparent=0" demos/palette-small.png`);
        await execAsync(`ffmpeg -i "${videoPath}" -i demos/palette-small.png -vf "fps=8,scale=640:-1:flags=lanczos,paletteuse=dither=bayer:bayer_scale=2" demos/obsi-lens-demo-small.gif`);
        
        console.log('🎉 GIF files generated successfully!');
        console.log('📁 Files created:');
        console.log('   - demos/obsi-lens-demo.gif (high quality)');
        console.log('   - demos/obsi-lens-demo-small.gif (for README)');
        
      } catch (error) {
        console.error('❌ Error converting video to GIF:', error);
        console.log('💡 Make sure ffmpeg is installed: brew install ffmpeg');
      }
    }
  });

  test('quick feature showcase', async ({ page }) => {
    // Shorter demo for GIF generation
    await page.waitForTimeout(3000);

    // Find and click image
    const imageElement = page.locator('img, .image-embed').first();
    await expect(imageElement).toBeVisible({ timeout: 10000 });
    await imageElement.click();

    // Wait for modal
    const modal = page.locator('.modal, .image-viewer-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Quick interactions
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      // Quick zoom
      await canvas.hover();
      await canvas.mouse.wheel(0, -200);
      await page.waitForTimeout(800);

      // Quick pan
      await page.mouse.down();
      await page.mouse.move(50, 50);
      await page.mouse.up();
      await page.waitForTimeout(800);

      // Rotate
      await page.keyboard.press('r');
      await page.waitForTimeout(800);
    }

    // Close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });
});