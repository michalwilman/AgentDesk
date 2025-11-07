# ============================
# AgentDesk Backend - Railway Optimized
# With Chromium for web scraping
# ============================

FROM node:20-alpine

WORKDIR /app

# Install dependencies including Chromium for Puppeteer
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment to skip Chromium download (use system Chromium)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm install --omit=optional && npm cache clean --force

# Copy source code
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
COPY public ./public

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port (Railway will set PORT via environment variable)
EXPOSE 3081

# Start server
CMD ["node", "dist/main.js"]
