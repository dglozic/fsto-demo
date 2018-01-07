FROM node:boron-slim

# Create app directory
WORKDIR /usr/src/angular-seed/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm install --only=production

# Bundle app source
COPY . .

# Set NODE_ENV to production (can be overriden with docker run)
ENV NODE_ENV=production K8S=true PORT=80

CMD [ "npm", "start" ]