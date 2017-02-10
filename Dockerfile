FROM mhart/alpine-node:6

RUN npm install -g bower gulp sails

WORKDIR /app

# Copy app
COPY . /app/

RUN npm --unsafe-perm install

EXPOSE 3000 1338

RUN chmod 777 ./start.sh

CMD ["/bin/sh","./start.sh"]