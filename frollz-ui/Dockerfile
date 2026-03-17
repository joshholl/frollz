# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN npm install && npm cache clean --force

# development stage
FROM node:20-alpine AS development

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

# Production build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
