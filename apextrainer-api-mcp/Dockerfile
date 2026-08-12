FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

# Workspace configuration
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Workspace packages
COPY apextrainer-api-mcp/package.json ./apextrainer-api-mcp/package.json
COPY shared/package.json ./shared/package.json

# Install MCP and its workspace dependencies
RUN pnpm install --filter apextrainer-mcp-server...

# Copy source
COPY apextrainer-api-mcp ./apextrainer-api-mcp
COPY shared ./shared

WORKDIR /app/apextrainer-api-mcp

# Build
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.cjs"]
