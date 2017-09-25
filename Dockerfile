
FROM mhart/alpine-node:6.11.3

RUN apk update && apk upgrade && \
    apk add --no-cache bash git


RUN npm install -g bower

WORKDIR /app

# Copy app
COPY . /app

RUN npm --unsafe-perm --verbose install --production

EXPOSE 1337

RUN chmod 777 ./start.sh

VOLUME kongadata

ENTRYPOINT ["/bin/bash","./start.sh"]