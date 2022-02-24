FROM node:alpine

WORKDIR /usr/src/app

RUN npm i  -g nodemon 

COPY package*.json ./


RUN npm install
RUN npm install -g pm2


# 安裝 ffmpeg
RUN apk add  --no-cache ffmpeg

RUN apk add --update alpine-sdk
RUN apk add zlib-dev
RUN apk add zlib-static

# 安裝 mp4box
RUN git clone https://github.com/gpac/gpac.git gpac_public
RUN cd gpac_public && ./configure --static-bin && make -j4
RUN cd gpac_public && make install; exit 0

COPY . .

EXPOSE 3000
EXPOSE 9200

