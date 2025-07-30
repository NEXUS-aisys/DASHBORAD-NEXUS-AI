# Production-Ready Multi-Stage Dockerfile for NexusTradeAI
# Optimized for scalability and security

# ==========================================
# STAGE 1: Build Dependencies
# ==========================================
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nexus -u 1001

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production && npm cache clean --force

# Install client dependencies  
WORKDIR /app/client
RUN npm ci --only=production && npm cache clean --force

# ==========================================
# STAGE 2: Build Client Application
# ==========================================
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client source and dependencies
COPY client/ ./
COPY --from=dependencies /app/client/node_modules ./node_modules

# Build optimized production client
ENV NODE_ENV=production
ENV REACT_APP_API_URL=/api
ENV GENERATE_SOURCEMAP=false

RUN npm run build

# ==========================================
# STAGE 3: Production Runtime
# ==========================================
FROM node:18-alpine AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Install production runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nexus -u 1001

# Copy server application and dependencies
COPY --from=dependencies /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy built client application
COPY --from=client-builder /app/client/build ./client/build

# Copy environment configuration
COPY .env* ./

# Create necessary directories and set permissions
RUN mkdir -p ./server/logs ./server/data && \
    chown -R nexus:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nexus

# Expose application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application with clustering enabled
CMD ["node", "server/server.js"]

# ==========================================
# Labels for metadata
# ==========================================
LABEL maintainer="NexusTradeAI Team"
LABEL version="1.0.0"
LABEL description="Production-ready NexusTradeAI futures trading platform"
LABEL org.opencontainers.image.title="NexusTradeAI"
LABEL org.opencontainers.image.description="Scalable AI-powered futures trading platform"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="NexusTradeAI"