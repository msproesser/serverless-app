FROM node:11

WORKDIR /app

RUN npm install -g esm
COPY node_modules /app/node_modules
COPY src /app/src
COPY package.json /app/package.json


CMD [ "npm", "run", "chain" ]