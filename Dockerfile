# Multi-stage build for production

# Stage 1: Build React app
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend server
FROM node:18-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

COPY server/ ./

# Copy built React app
COPY --from=client-builder /app/client/build ./public

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]

