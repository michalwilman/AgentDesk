# ============================
# AgentDesk Backend - Production Build
# Optimized for Railway - No Chromium
# ============================

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install base dependencies only (no chromium)
RUN apk add --no-cache \
  python3 \
  make \
  g++

# Copy only package files for better caching
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm install && npm cache clean --force

# Copy source files needed for build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build

# ============================
# Stage 2: Production Image
# ============================
FROM node:18-alpine AS production

WORKDIR /app

# Install only minimal dependencies
RUN apk add --no-cache \
  python3

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose default port used by Railway
ENV PORT=8080
EXPOSE 8080

# Start the production server
CMD ["node", "dist/main.js"]
