# backend/Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port and start the server
EXPOSE 5000
CMD ["nodemon", "server.js"]
