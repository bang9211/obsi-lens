#!/usr/bin/env node

/**
 * Demo GIF Generation Script for Obsi-Lens Plugin
 * Automatically generates demo GIFs using Playwright
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEMO_CONFIG = {
  outputDir: 'demos',
  videoDir: 'tests/videos',
  gifQuality: 80,
  fps: 15,
  scale: 800
};

async function generateDemos() {
  console.log('🎬 Starting demo generation...');

  // Ensure directories exist
  ensureDirectories();

  // Run Playwright tests that generate videos
  try {
    console.log('📹 Recording demo scenarios...');
    execSync('npx playwright test demo-recording.spec.ts --project=demo-recording', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Demo recording failed:', error.message);
    console.log('⚠️  Continuing with existing videos if available...');
  }

  // Convert videos to GIFs
  await convertVideosToGifs();

  // Generate different demo versions
  await generateDemoVariants();

  console.log('✅ Demo generation complete!');
  console.log(`📁 Demos saved to: ${DEMO_CONFIG.outputDir}/`);
}

function ensureDirectories() {
  [DEMO_CONFIG.outputDir, DEMO_CONFIG.videoDir, 'tests/screenshots'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

async function convertVideosToGifs() {
  console.log('🔄 Converting videos to GIFs...');
  
  const videoFiles = fs.readdirSync(DEMO_CONFIG.videoDir)
    .filter(file => file.endsWith('.webm'));

  for (const videoFile of videoFiles) {
    const inputPath = path.join(DEMO_CONFIG.videoDir, videoFile);
    const outputName = videoFile.replace('.webm', '.gif');
    const outputPath = path.join(DEMO_CONFIG.outputDir, outputName);

    try {
      // Convert with ffmpeg
      const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "fps=${DEMO_CONFIG.fps},scale=${DEMO_CONFIG.scale}:-1:flags=lanczos" -loop 0 "${outputPath}"`;
      execSync(ffmpegCmd, { stdio: 'pipe' });

      // Optimize GIF
      const optimizeCmd = `gifsicle -O3 --lossy=${DEMO_CONFIG.gifQuality} "${outputPath}" -o "${outputPath}"`;
      try {
        execSync(optimizeCmd, { stdio: 'pipe' });
        console.log(`✅ Generated: ${outputName}`);
      } catch (e) {
        console.log(`⚠️  Generated: ${outputName} (optimization skipped - install gifsicle for better compression)`);
      }
    } catch (error) {
      console.error(`❌ Failed to convert ${videoFile}:`, error.message);
    }
  }
}

async function generateDemoVariants() {
  console.log('🎨 Generating demo variants...');

  // Generate different sizes and qualities
  const variants = [
    { name: 'demo-small', scale: 600, quality: 60 },
    { name: 'demo-medium', scale: 800, quality: 80 },
    { name: 'demo-large', scale: 1200, quality: 90 }
  ];

  const sourceGif = path.join(DEMO_CONFIG.outputDir, 'demo.gif');
  if (!fs.existsSync(sourceGif)) {
    console.log('⚠️  No source demo.gif found, skipping variants');
    return;
  }

  for (const variant of variants) {
    const outputPath = path.join(DEMO_CONFIG.outputDir, `${variant.name}.gif`);
    try {
      const cmd = `gifsicle --resize ${variant.scale}x --lossy=${variant.quality} "${sourceGif}" -o "${outputPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      console.log(`✅ Generated variant: ${variant.name}.gif`);
    } catch (error) {
      console.log(`⚠️  Skipped variant ${variant.name} (gifsicle required)`);
    }
  }
}

// CLI execution
if (require.main === module) {
  generateDemos().catch(console.error);
}

module.exports = { generateDemos };