FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Dependencies
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd backend && npm install

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "backend/server.js"]
