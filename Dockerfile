FROM node:8.12-alpine

ARG KONGA_PG_HOST
ARG KONGA_PG_USER
ARG KONGA_PG_PASSWORD
ARG KONGA_PG_DATABASE
ARG KONGA_NODE_ENV
ARG KONGA_TOKEN
ENV NODE_ENV="$KONGA_NODE_ENV"
ENV TOKEN_SECRET="$KONGA_TOKEN"
ENV DB_ADAPTER="postgres"
ENV DB_URI="postgresql://$KONGA_PG_USER:$KONGA_PG_PASSWORD@$KONGA_PG_HOST:5432/$KONGA_PG_DATABASE"

COPY . /app

WORKDIR /app

RUN apk upgrade --update \
    && apk add bash git ca-certificates python make g++ \
    && npm install -g node-gyp \
    && npm install -g bower \
    && npm --unsafe-perm --production install \
    && apk del git \
    && rm -rf /var/cache/apk/* \
        /app/.git \
        /app/screenshots \
        /app/test

EXPOSE 1337

ENTRYPOINT ["/app/start.sh"]
