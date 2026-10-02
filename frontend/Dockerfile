# Use an official Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Run the Vite dev server (it proxies /books to the backend, see vite.config.ts)
CMD ["npm", "run", "dev"]
