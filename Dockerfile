# Production Dockerfile for GangrunPrinting
# Tech Stack: Next.js 15.5.2, Node.js 20, PostgreSQL, Redis, Lucia Auth

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++ openssl openssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --legacy-peer-deps && \
    npx prisma generate

# Copy source code
COPY . .

# Build Next.js application
# Accept NEXT_PUBLIC_ env vars as build args
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_SQUARE_APPLICATION_ID
ARG NEXT_PUBLIC_SQUARE_LOCATION_ID
ARG NEXT_PUBLIC_SQUARE_ENVIRONMENT

# Make them available during build
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_SQUARE_APPLICATION_ID=$NEXT_PUBLIC_SQUARE_APPLICATION_ID
ENV NEXT_PUBLIC_SQUARE_LOCATION_ID=$NEXT_PUBLIC_SQUARE_LOCATION_ID
ENV NEXT_PUBLIC_SQUARE_ENVIRONMENT=$NEXT_PUBLIC_SQUARE_ENVIRONMENT

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat openssl

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy all node_modules (Next.js standalone doesn't include all dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create upload directories with correct ownership
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]