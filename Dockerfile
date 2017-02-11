FROM mhart/alpine-node

RUN apk update && apk upgrade && \
    apk add --no-cache make gcc g++ python bash git


RUN npm install -g bower gulp


WORKDIR /app

# Copy app
COPY . /app/

RUN npm --unsafe-perm --verbose install

EXPOSE 3000 1338

RUN chmod 777 ./start.sh

CMD ["/bin/bash","./start.sh"]