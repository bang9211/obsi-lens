import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

async function globalSetup() {
  console.log('🔧 Setting up Obsidian plugin test environment...');

  // Ensure plugin is built and up to date
  try {
    console.log('📦 Building plugin...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Plugin built successfully');
  } catch (error) {
    console.error('❌ Plugin build failed:', error);
    throw error;
  }

  // Setup test vault
  const testVaultPath = path.join(process.cwd(), 'test-vault');
  const pluginPath = path.join(testVaultPath, '.obsidian', 'plugins', 'obsi-lens');

  console.log('🏗️  Setting up test vault...');
  
  // Create test vault structure
  await fs.ensureDir(path.join(testVaultPath, 'images'));
  await fs.ensureDir(path.join(testVaultPath, 'attachments'));
  await fs.ensureDir(pluginPath);

  // Verify plugin installation in vault
  const vaultPluginPath = '/Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet/.obsidian/plugins/obsi-lens';
  
  if (!fs.existsSync(vaultPluginPath)) {
    console.log('📁 Creating plugin directory in vault...');
    fs.mkdirSync(vaultPluginPath, { recursive: true });
  }

  // Copy plugin files to test vault
  const filesToCopy = ['main.js', 'manifest.json', 'styles.css'];
  
  for (const file of filesToCopy) {
    const sourcePath = path.join(__dirname, '../', file);
    const testVaultDestPath = path.join(pluginPath, file);
    const realVaultDestPath = path.join(vaultPluginPath, file);
    
    if (await fs.pathExists(sourcePath)) {
      // Copy to test vault
      await fs.copy(sourcePath, testVaultDestPath);
      // Copy to real vault for development
      await fs.copy(sourcePath, realVaultDestPath);
      console.log(`✅ Copied ${file} to both test and development vaults`);
    } else {
      console.warn(`⚠️  ${file} not found in build output`);
    }
  }

  // Create test markdown files
  const testMarkdown = `# Test Note for Image Viewer

This note contains test images for the obsi-lens plugin testing.

![Test Image 1](images/test1.jpg)

Some text between images.

![Test Image 2](images/test2.png)

## Multiple Images Section

- ![Small Image](images/small.jpg)
- ![Large Image](images/large.jpg)
- ![Animated GIF](images/animated.gif)

## Testing Features

This section tests various plugin features:
- Image viewer modal opening  
- Drawing tools functionality
- Keyboard shortcuts
- Multi-image navigation
- Popout window support
`;

  await fs.writeFile(path.join(testVaultPath, 'test-note.md'), testMarkdown);

  // Create Obsidian config with plugin enabled
  const obsidianConfig = {
    plugins: {
      'obsi-lens': true
    },
    pluginEnabledStatus: {
      'obsi-lens': true
    }
  };

  await fs.writeFile(
    path.join(testVaultPath, '.obsidian', 'config.json'),
    JSON.stringify(obsidianConfig, null, 2)
  );

  // Copy demo images to test vault if they exist
  const demoImages = ['image_sample1.png', 'image_sample2.png', 'image_sample3.png'];
  for (const img of demoImages) {
    const srcPath = path.join(__dirname, '../', img);
    if (await fs.pathExists(srcPath)) {
      await fs.copy(srcPath, path.join(testVaultPath, 'images', img));
      console.log(`✅ Copied demo image: ${img}`);
    }
  }

  // Create necessary test directories
  const testDirs = ['tests/screenshots', 'tests/videos', 'demos'];
  for (const dir of testDirs) {
    await fs.ensureDir(dir);
    console.log(`📁 Ensured directory exists: ${dir}`);
  }

  console.log('🎉 Test environment setup complete!');
  console.log(`📁 Test vault location: ${testVaultPath}`);
}

export default globalSetup;