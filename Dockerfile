# ---------- Build stage ----------
FROM oven/bun:1 AS builder
WORKDIR /app

# Install deps (cached layer)
COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install

# Copy source
COPY . .

# Build for a Node.js server (instead of Cloudflare Workers)
ENV NITRO_PRESET=node-server
RUN bun run build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Nitro node-server output is self-contained under .output/
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
