
# Stage 1: Build React application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Build production files
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine AS final

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add our Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
