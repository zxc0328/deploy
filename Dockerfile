FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN apt-get -y update
RUN apt-get -y install curl

RUN npm install

# Bundle app source
CMD [ "npm", "start" ]