FROM mhart/alpine-node

RUN apk update && apk upgrade && \
    apk add --no-cache bash git


RUN npm install -g bower gulp

WORKDIR /app

# Copy app
COPY ./backend /app/backend
COPY ./frontend /app/frontend
COPY ./.dockerignore /app/.dockerignore
COPY ./.gitignore /app/.gitignore
COPY ./.travis.yml /app/.travis.yml
COPY ./Dockerfile /app/Dockerfile
COPY ./LICENSE /app/LICENSE
COPY ./package.json /app/package.json
COPY ./README.md /app/README.md
COPY ./start.sh /app/start.sh

RUN npm --unsafe-perm --verbose install

EXPOSE 3000 1338

RUN chmod 777 ./start.sh

CMD ["/bin/bash","./start.sh"]