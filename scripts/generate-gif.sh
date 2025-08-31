#!/bin/bash

# generate-gif.sh
# Script to generate demo GIF using Playwright

set -e

echo "🎬 Obsi-Lens Demo GIF Generator"
echo "================================"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "💡 Install with: brew install ffmpeg"
    exit 1
fi

# Ensure directories exist
mkdir -p demos
mkdir -p test-results

echo "📦 Building plugin..."
npm run build

echo "🧪 Running demo recording test..."
npx playwright test tests/demo-recording.spec.ts --project=demo-recording --grep="generate demo GIF"

# Check if GIF files were created
if [ -f "demos/obsi-lens-demo.gif" ]; then
    echo "✅ High quality GIF created: demos/obsi-lens-demo.gif"
    
    # Get file size
    gif_size=$(du -h "demos/obsi-lens-demo.gif" | cut -f1)
    echo "📏 File size: $gif_size"
fi

if [ -f "demos/obsi-lens-demo-small.gif" ]; then
    echo "✅ Small GIF created: demos/obsi-lens-demo-small.gif"
    
    # Get file size
    small_gif_size=$(du -h "demos/obsi-lens-demo-small.gif" | cut -f1)
    echo "📏 File size: $small_gif_size"
fi

# Clean up temp files
if [ -f "demos/palette.png" ]; then
    rm demos/palette.png
fi

if [ -f "demos/palette-small.png" ]; then
    rm demos/palette-small.png
fi

echo ""
echo "🎉 Demo GIF generation completed!"
echo ""
echo "📁 Generated files:"
echo "   - demos/obsi-lens-demo.gif (for showcases)"
echo "   - demos/obsi-lens-demo-small.gif (for README)"
echo ""
echo "💡 Usage suggestions:"
echo "   - Add to README.md for project showcase"
echo "   - Share on social media or documentation"
echo "   - Include in plugin store submissions"