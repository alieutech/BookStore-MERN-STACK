# Use an official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the server runs on
EXPOSE 3333

# Start the API (it only serves the API; the frontend runs in its own container)
CMD ["node", "server.js"]
