FROM node:22-alpine AS build

RUN corepack enable

WORKDIR /app

COPY shared ./shared
COPY SparkyFitnessFrontend ./SparkyFitnessFrontend

RUN printf 'packages:\n  - "SparkyFitnessFrontend"\n  - "shared"\n' > pnpm-workspace.yaml

WORKDIR /app
RUN pnpm install

WORKDIR /app/SparkyFitnessFrontend
RUN pnpm run build:dev

FROM nginx:alpine

COPY --from=build /app/SparkyFitnessFrontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]