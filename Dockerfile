FROM node:6

#RUN apk update && apk upgrade && \
#    apk add --no-cache bash git


RUN npm install -g bower gulp


WORKDIR /app

# Copy app
COPY . /app/

RUN npm --unsafe-perm install

EXPOSE 3000 1338

RUN chmod 777 ./start.sh

CMD ["/bin/bash","./start.sh"]