FROM node:11

WORKDIR /app

ENV PEER_ID_FILE=/app/peer-id.json
ENV SNAPSHOT_FILE=/app/snapshot.json

RUN npm install -g esm
COPY node_modules /app/node_modules
COPY src /app/src
COPY package.json /app/package.json

EXPOSE 20000

CMD [ "npm", "run", "chain" ]
