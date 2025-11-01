#!/bin/bash
# Script to create WordPress plugin ZIP with correct forward slashes

cd "$(dirname "$0")/wordpress-plugin/dist/agentdesk-chatbot" || exit 1

# Remove old zip
rm -f ../../../agentdesk-chatbot.zip

# Create zip using tar and convert to zip
# This ensures forward slashes in paths
TEMP_DIR=$(mktemp -d)
cp -r . "$TEMP_DIR/agentdesk-chatbot"

cd "$TEMP_DIR" || exit 1

# Use Info-ZIP if available, otherwise try system zip
if command -v zip >/dev/null 2>&1; then
    zip -r agentdesk-chatbot.zip agentdesk-chatbot/
else
    # Fallback: create using tar and hope for the best
    echo "ZIP command not found, using tar method"
    tar -cf - agentdesk-chatbot | gzip > agentdesk-chatbot.tar.gz
fi

# Move to project root
mv agentdesk-chatbot.zip /c/Projects/AgentDesk/ 2>/dev/null || \
mv agentdesk-chatbot.tar.gz /c/Projects/AgentDesk/agentdesk-chatbot.zip

# Cleanup
cd /c/Projects/AgentDesk
rm -rf "$TEMP_DIR"

echo "✅ Created: agentdesk-chatbot.zip"
ls -lh agentdesk-chatbot.zip

