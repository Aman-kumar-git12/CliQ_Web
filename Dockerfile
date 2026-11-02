# The built site served by nginx. VITE_* values are baked in at build time:
#   docker build --build-arg VITE_BACKEND_URL=https://api.example.com -t cliq-frontend .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_BACKEND_URL=http://localhost:2004
ARG VITE_SENTRY_DSN=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
