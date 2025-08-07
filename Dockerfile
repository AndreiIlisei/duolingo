FROM --platform=linux/amd64 node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# COPY .env.local ./.env
COPY . .

# Accept a build-time flag
ARG LOCAL_ENV=false
# Conditionally copy .env.local
RUN if [ "$LOCAL_ENV" = "true" ] && [ -f .env.local ]; then cp .env.local .env; fi

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG CLERK_SECRET_KEY
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy database and migration files
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/database ./database
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib

# Copy package.json and node_modules for migrations
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# ✅ Copy the .env file to runtime
COPY --from=builder /app/.env ./.env

EXPOSE 3000
ENV PORT=3000

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && node server.js"]