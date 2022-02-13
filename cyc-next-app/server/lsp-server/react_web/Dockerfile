FROM node:14.15.4

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
#RUN npm run lint:fix

# Bundle app source
COPY . .

EXPOSE 3002

CMD ["npm", "start"]
