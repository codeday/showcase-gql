FROM node:14.8 as builder
RUN apt-get -qy update && apt-get install -qy openssl
WORKDIR /app
COPY ./package.json ./yarn.lock /app/
RUN yarn install && npm i -g @prisma/cli@2.12.1

COPY ./ /app

RUN prisma generate && yarn run build

FROM node:14.8-slim as runtime
RUN apt-get -qy update && apt-get install -qy openssl

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"

CMD ["npm", "run", "start"]
