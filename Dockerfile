# Multi-stage build for GangrunPrinting v1
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including Sharp for image processing
RUN npm ci --only=production && \
    npm install sharp && \
    npm install -g prisma && \
    npx prisma generate

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install runtime dependencies for Sharp
RUN apk add --no-cache libc6-compat

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp

# Create necessary directories
RUN mkdir -p /app/uploads /app/print-files && \
    chown -R nextjs:nodejs /app/uploads /app/print-files

USER nextjs

# Port 3002 for GangrunPrinting
EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]