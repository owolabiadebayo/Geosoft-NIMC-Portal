# Start with a base image containing Node.js
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install project dependencies
RUN npm install

# Copy the current directory contents into the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Use PM2 to start the application
CMD ["pm2-runtime", "ecosystem.config.js"]
