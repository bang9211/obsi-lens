# Obsi-Lens Plugin Makefile

# Configuration
PLUGIN_NAME = obsi-lens
VAULT_PATH = /Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet
PLUGIN_DIR = $(VAULT_PATH)/.obsidian/plugins/$(PLUGIN_NAME)

# Source files to copy
FILES = main.js manifest.json styles.css

# Default target
.PHONY: all
all: build

# Build and install plugin
.PHONY: build
build: clean compile install
	@echo "✅ Plugin built and installed successfully!"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f main.js

# Install dependencies
.PHONY: deps
deps:
	@echo "📦 Installing dependencies..."
	@npm install

# Compile TypeScript to JavaScript
.PHONY: compile
compile: deps
	@echo "🔨 Building plugin..."
	@npm run build

# Install plugin to Obsidian vault
.PHONY: install
install:
	@echo "📂 Creating plugin directory..."
	@mkdir -p "$(PLUGIN_DIR)"
	@echo "📋 Copying plugin files..."
	@cp $(FILES) "$(PLUGIN_DIR)/"
	@echo "📍 Plugin installed to: $(PLUGIN_DIR)"

# Development mode - build and install with watch
.PHONY: dev
dev: compile install
	@echo "🔧 Starting development mode..."
	@npm run dev &
	@echo "👀 Watching for changes... (Press Ctrl+C to stop)"

# Uninstall plugin from vault
.PHONY: uninstall
uninstall:
	@echo "🗑️  Removing plugin from vault..."
	@rm -rf "$(PLUGIN_DIR)"
	@echo "✅ Plugin uninstalled"

# Show plugin status
.PHONY: status
status:
	@echo "📊 Plugin Status:"
	@echo "   Plugin Name: $(PLUGIN_NAME)"
	@echo "   Vault Path: $(VAULT_PATH)"
	@echo "   Plugin Dir: $(PLUGIN_DIR)"
	@if [ -d "$(PLUGIN_DIR)" ]; then \
		echo "   Status: ✅ Installed"; \
		echo "   Files:"; \
		ls -la "$(PLUGIN_DIR)"; \
	else \
		echo "   Status: ❌ Not installed"; \
	fi

# Force reinstall (clean install)
.PHONY: reinstall
reinstall: uninstall build

# Help
.PHONY: help
help:
	@echo "🔧 Obsi-Lens Plugin Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make build      - Build and install plugin (default)"
	@echo "  make dev        - Build, install and watch for changes"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deps       - Install npm dependencies"
	@echo "  make install    - Install plugin to vault (after build)"
	@echo "  make uninstall  - Remove plugin from vault"
	@echo "  make reinstall  - Clean reinstall"
	@echo "  make status     - Show plugin installation status"
	@echo "  make help       - Show this help message"