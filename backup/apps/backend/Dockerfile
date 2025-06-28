FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types

# Build the application
WORKDIR /app/apps/backend
RUN pnpm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"] 