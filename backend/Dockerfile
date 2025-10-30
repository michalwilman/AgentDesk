# ============================
# AgentDesk Backend - Railway Optimized
# Fast build without Chromium/Puppeteer
# ============================

FROM node:20-alpine

WORKDIR /app

# Install minimal dependencies
RUN apk add --no-cache python3 make g++

# Set environment to skip Chromium download
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

# Expose port (Railway will override with PORT variable)
ENV PORT=3081
EXPOSE 3081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3081/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start server
CMD ["node", "dist/main.js"]
