# Obsidian Plugin Unified Makefile
# Supports both obsi-table and obsi-lens plugins

# Auto-detect plugin name from directory
CURRENT_DIR := $(notdir $(CURDIR))
PLUGIN_NAME := $(CURRENT_DIR)

# Configuration
VAULT_PATH = /Users/al03040382/Library/Mobile Documents/iCloud~md~obsidian/Documents/Black Sorbet
PLUGIN_DIR = $(VAULT_PATH)/.obsidian/plugins/$(PLUGIN_NAME)

# Source files to copy
FILES = main.js manifest.json styles.css

# Default target
.PHONY: all
all: build

# Build and install plugin
.PHONY: build
build: clean compile install-to-vault
	@echo "✅ $(PLUGIN_NAME) built and installed successfully!"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f main.js
	@rm -f *.js.map

# Install dependencies
.PHONY: deps install
deps install:
	@echo "📦 Installing dependencies..."
	@npm install

# Compile TypeScript to JavaScript
.PHONY: compile
compile: deps
	@echo "🔨 Building $(PLUGIN_NAME)..."
	@npm run build

# Install plugin to Obsidian vault
.PHONY: install-to-vault
install-to-vault:
	@echo "📂 Creating plugin directory..."
	@mkdir -p "$(PLUGIN_DIR)"
	@echo "📋 Copying plugin files..."
	@for file in $(FILES); do \
		if [ -f "$$file" ]; then \
			cp "$$file" "$(PLUGIN_DIR)/"; \
		fi; \
	done
	@echo "📍 $(PLUGIN_NAME) installed to: $(PLUGIN_DIR)"

# Development mode - build and install with watch
.PHONY: dev
dev: compile install-to-vault
	@echo "🔧 Starting development mode for $(PLUGIN_NAME)..."
	@npm run dev &
	@echo "👀 Watching for changes... (Press Ctrl+C to stop)"

# Run linting
.PHONY: lint
lint:
	@echo "🔍 Running ESLint..."
	@npm run lint

# Fix linting issues
.PHONY: lint-fix
lint-fix:
	@echo "🔧 Fixing ESLint issues..."
	@npm run lint:fix

# Format code
.PHONY: format
format:
	@echo "✨ Formatting code with Prettier..."
	@npm run format

# Development setup
.PHONY: setup
setup: install
	@echo "✅ $(PLUGIN_NAME) setup complete!"
	@echo "Run 'make dev' to start development mode"

# Uninstall plugin from vault
.PHONY: uninstall
uninstall:
	@echo "🗑️  Removing $(PLUGIN_NAME) from vault..."
	@rm -rf "$(PLUGIN_DIR)"
	@echo "✅ $(PLUGIN_NAME) uninstalled"

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

# Test build without installation
.PHONY: test-build
test-build: clean
	@echo "🧪 Testing build for $(PLUGIN_NAME)..."
	@npm run build
	@echo "✅ Build test successful"

# Help
.PHONY: help
help:
	@echo "🔧 Obsidian Plugin Unified Makefile"
	@echo "   Current Plugin: $(PLUGIN_NAME)"
	@echo ""
	@echo "Available commands:"
	@echo "  make build      - Build and install plugin to vault (default)"
	@echo "  make dev        - Build, install and watch for changes"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deps       - Install npm dependencies"
	@echo "  make install    - Install npm dependencies (alias for deps)"
	@echo "  make compile    - Compile TypeScript only"
	@echo "  make install-to-vault - Install plugin files to vault"
	@echo "  make lint       - Run ESLint"
	@echo "  make lint-fix   - Fix ESLint issues automatically"
	@echo "  make format     - Format code with Prettier"
	@echo "  make setup      - Install dependencies and setup development"
	@echo "  make uninstall  - Remove plugin from vault"
	@echo "  make reinstall  - Clean reinstall"
	@echo "  make status     - Show plugin installation status"
	@echo "  make test-build - Test build without installation"
	@echo "  make help       - Show this help message"