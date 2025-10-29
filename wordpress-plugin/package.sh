#!/bin/bash

##
# AgentDesk WordPress Plugin - Package Script
# Creates a production-ready ZIP file for WordPress.org submission
##

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║   AgentDesk WordPress Plugin Packager    ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Plugin details
PLUGIN_SLUG="agentdesk-chatbot"
VERSION="1.0.0"
OUTPUT_DIR="dist"
ZIP_NAME="${PLUGIN_SLUG}-${VERSION}.zip"

# Step 1: Clean previous builds
echo -e "${YELLOW}► Cleaning previous builds...${NC}"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✓ Build directory cleaned${NC}\n"

# Step 2: Create temporary directory
echo -e "${YELLOW}► Creating package structure...${NC}"
TEMP_DIR="$OUTPUT_DIR/$PLUGIN_SLUG"
mkdir -p "$TEMP_DIR"
echo -e "${GREEN}✓ Package structure created${NC}\n"

# Step 3: Copy files
echo -e "${YELLOW}► Copying plugin files...${NC}"

# Main plugin file
cp agentdesk-chatbot.php "$TEMP_DIR/"

# Readme
cp readme.txt "$TEMP_DIR/"
cp INSTALLATION.md "$TEMP_DIR/"

# Includes
mkdir -p "$TEMP_DIR/includes"
cp includes/*.php "$TEMP_DIR/includes/"

# Assets
mkdir -p "$TEMP_DIR/assets/css"
mkdir -p "$TEMP_DIR/assets/js"
mkdir -p "$TEMP_DIR/assets/images"

cp assets/css/*.css "$TEMP_DIR/assets/css/"
cp assets/js/*.js "$TEMP_DIR/assets/js/"

# Languages
mkdir -p "$TEMP_DIR/languages"
cp languages/*.pot "$TEMP_DIR/languages/"
cp languages/*.po "$TEMP_DIR/languages/"

# Generate .mo files from .po files
if command -v msgfmt &> /dev/null; then
    echo -e "${YELLOW}► Compiling translations...${NC}"
    for po_file in languages/*.po; do
        if [ -f "$po_file" ]; then
            mo_file="${po_file%.po}.mo"
            msgfmt -o "$TEMP_DIR/${mo_file}" "$po_file"
            echo "  ✓ Compiled $(basename $mo_file)"
        fi
    done
    echo -e "${GREEN}✓ Translations compiled${NC}\n"
else
    echo -e "${YELLOW}⚠ msgfmt not found, skipping .mo compilation${NC}"
    echo -e "${YELLOW}  Install gettext to compile translations${NC}\n"
fi

echo -e "${GREEN}✓ Files copied${NC}\n"

# Step 4: Create placeholder images
echo -e "${YELLOW}► Creating placeholder assets...${NC}"

# Create a simple text file as placeholder for images
cat > "$TEMP_DIR/assets/images/README.txt" << EOF
# AgentDesk Plugin Assets

## Required Images for WordPress.org Submission:

1. icon-128x128.png - Plugin icon (square, 128x128px)
2. icon-256x256.png - Plugin icon retina (square, 256x256px)
3. banner-772x250.png - Plugin directory banner
4. banner-1544x500.png - Plugin directory banner retina (optional)

## Screenshots (for readme.txt):
- screenshot-1.png - Chatbot widget on site
- screenshot-2.png - Admin settings panel
- screenshot-3.png - Bot training dashboard
- screenshot-4.png - Analytics view
- screenshot-5.png - Mobile view

## Image Requirements:
- PNG format (optimized)
- No text overlay on icons
- Professional appearance
- Match AgentDesk branding (#00E0C6)

Upload these images to WordPress.org after plugin approval.
EOF

echo -e "${GREEN}✓ Placeholder assets created${NC}\n"

# Step 5: Validate plugin structure
echo -e "${YELLOW}► Validating plugin structure...${NC}"

# Check required files
REQUIRED_FILES=(
    "agentdesk-chatbot.php"
    "readme.txt"
    "includes/class-agentdesk-admin.php"
    "includes/class-agentdesk-widget.php"
    "includes/class-agentdesk-api.php"
)

ALL_VALID=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$TEMP_DIR/$file" ]; then
        echo -e "${RED}✗ Missing required file: $file${NC}"
        ALL_VALID=false
    else
        echo -e "  ✓ $file"
    fi
done

if [ "$ALL_VALID" = false ]; then
    echo -e "\n${RED}✗ Validation failed! Missing required files.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Plugin structure validated${NC}\n"

# Step 6: Check for development files
echo -e "${YELLOW}► Removing development files...${NC}"
find "$TEMP_DIR" -name ".DS_Store" -delete
find "$TEMP_DIR" -name "Thumbs.db" -delete
find "$TEMP_DIR" -name ".git*" -delete
echo -e "${GREEN}✓ Development files removed${NC}\n"

# Step 7: Create ZIP file
echo -e "${YELLOW}► Creating ZIP package...${NC}"
cd "$OUTPUT_DIR"
zip -r "$ZIP_NAME" "$PLUGIN_SLUG" -q
cd ..

if [ -f "$OUTPUT_DIR/$ZIP_NAME" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_DIR/$ZIP_NAME" | awk '{print $5}')
    echo -e "${GREEN}✓ ZIP package created: $ZIP_NAME ($FILE_SIZE)${NC}\n"
else
    echo -e "${RED}✗ Failed to create ZIP package${NC}"
    exit 1
fi

# Step 8: Cleanup temporary directory
echo -e "${YELLOW}► Cleaning up...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✓ Temporary files removed${NC}\n"

# Step 9: Generate checksums
echo -e "${YELLOW}► Generating checksums...${NC}"
cd "$OUTPUT_DIR"

if command -v md5sum &> /dev/null; then
    md5sum "$ZIP_NAME" > "${ZIP_NAME}.md5"
    echo -e "  ✓ MD5: $(cat ${ZIP_NAME}.md5)"
fi

if command -v sha256sum &> /dev/null; then
    sha256sum "$ZIP_NAME" > "${ZIP_NAME}.sha256"
    echo -e "  ✓ SHA256: $(cat ${ZIP_NAME}.sha256)"
fi

cd ..
echo -e "${GREEN}✓ Checksums generated${NC}\n"

# Step 10: Package info
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║           Package Complete! 🎉            ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Package Details:${NC}"
echo "  Plugin: $PLUGIN_SLUG"
echo "  Version: $VERSION"
echo "  File: $OUTPUT_DIR/$ZIP_NAME"
echo "  Size: $FILE_SIZE"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test the plugin on a fresh WordPress install"
echo "  2. Upload to WordPress.org for review"
echo "  3. Respond to reviewer feedback"
echo "  4. Publish to plugin directory"
echo ""

echo -e "${GREEN}Testing Command:${NC}"
echo "  wp plugin install $OUTPUT_DIR/$ZIP_NAME --activate"
echo ""

echo -e "${GREEN}Submission URL:${NC}"
echo "  https://wordpress.org/plugins/developers/add/"
echo ""

echo -e "${YELLOW}Don't forget to:${NC}"
echo "  □ Create plugin icon images (128x128, 256x256)"
echo "  □ Create banner images (772x250, 1544x500)"
echo "  □ Take screenshots (1-5 images)"
echo "  □ Test on WordPress 5.8+"
echo "  □ Test on PHP 7.4+"
echo "  □ Test with popular themes"
echo "  □ Test with popular plugins (WooCommerce, etc.)"
echo ""

echo -e "${GREEN}✓ Package ready for submission!${NC}"

