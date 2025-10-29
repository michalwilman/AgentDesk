# AgentDesk Backend Dockerfile
# Multi-stage build for optimal production image

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies needed for Puppeteer in Alpine
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Copy TypeScript config
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code
COPY src ./src

# Build the NestJS application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production && npm cache clean --force

# Copy built application from builder stage (includes widget-standalone.js)
COPY --from=builder /app/dist ./dist

# Copy public folder if it exists
COPY --from=builder /app/public ./public 2>/dev/null || true

# Expose the port (Railway will override this with PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/main.js"]

