FROM mhart/alpine-node

RUN apk update && apk upgrade && \
    apk add --no-cache bash git


RUN npm install -g bower

WORKDIR /app

# Copy app
COPY . /app

RUN npm --unsafe-perm --verbose install --production

EXPOSE 3000 1338

RUN chmod 777 ./start.sh

ENTRYPOINT ["/bin/bash","./start.sh"]