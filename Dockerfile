FROM node:8.4.0-slim
MAINTAINER Asbjørn Dyhrberg Thegler <devops@deranged.dk>

RUN apt-get update
RUN apt-get install gcc g++ make python -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app
RUN rm -rf node_modules
RUN npm install

EXPOSE 6080

ENV NODE_ENV production

CMD [ "npm", "start" ]
