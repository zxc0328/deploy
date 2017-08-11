FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm install

# Bundle app source
EXPOSE 3000
CMD [ "npm", "start" ]