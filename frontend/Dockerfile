# Use an official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 5173

# Serve the built app using a simple server
CMD ["npm", "run", "dev"]

# 827a37e03d5a7924305b3fefa1b37fdcf531bfea8f7d4455c41da5134ac7761d