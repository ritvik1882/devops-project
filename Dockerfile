FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy the entire project
COPY . .

# Install all dependencies and build the app
RUN npm install
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
