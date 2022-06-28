FROM node:14.19.3-alpine

WORKDIR /animaris

COPY production.js /animaris/production.js
COPY package.json /animaris/package.json
COPY package-lock.json /animaris/package-lock.json
COPY app /animaris/app
COPY config.json /animaris/config.json

RUN mkdir /downloads && npm i --production --registry=https://repo.huaweicloud.com/repository/npm/ && \
    npm cache clean -f 


EXPOSE 8360
CMD [ "node", "/animaris/production.js" ]