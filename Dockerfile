FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
