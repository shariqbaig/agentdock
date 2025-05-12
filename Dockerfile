# Backend Dockerfile
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build TypeScript code
RUN npm run build

# Frontend Dockerfile
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build React app
RUN npm run build

# Production image for Backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy built backend files
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Create data and logs directories
RUN mkdir -p data/agents logs

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]

# Production image for Frontend
FROM nginx:alpine AS frontend

# Copy built frontend files to nginx serve directory
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]