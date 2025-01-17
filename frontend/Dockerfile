# Stage 1: Build the app
FROM oven/bun:latest AS build-stage

# Set the working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN bun install

# Build the app
RUN bun run build

# Stage 2: Production stage
FROM nginx:stable-alpine AS production-stage

# Copy the built app to the nginx web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]