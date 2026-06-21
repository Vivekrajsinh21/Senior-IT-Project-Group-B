FROM node:22-alpine AS build

WORKDIR /app/SparkyFitnessFrontend

COPY SparkyFitnessFrontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY SparkyFitnessFrontend/ .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/SparkyFitnessFrontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]