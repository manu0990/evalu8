FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages directory for workspace dependencies
COPY packages/ ./packages/

# Copy the ws-server app
COPY apps/ws-server/ ./apps/ws-server/

# Install dependencies from the root
RUN pnpm install

# Build the ws-server app
WORKDIR /app/apps/ws-server
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/ws-server/package.json ./apps/ws-server/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/ws-server/dist ./apps/ws-server/dist

WORKDIR /app/apps/ws-server

EXPOSE 8080

CMD ["pnpm", "start"]