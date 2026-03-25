FROM node:20-alpine3.18 AS builder
RUN apk add --no-cache openssl postgresql-client
WORKDIR /app
COPY ./package.json ./yarn.lock /app/
RUN yarn install

COPY ./ /app

RUN yarn prisma generate && yarn run build

FROM node:20-alpine3.18 AS runtime
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"
COPY --from=builder "/app/prisma/" "/app/prisma/"
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN mkdir -p /app/dist
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
