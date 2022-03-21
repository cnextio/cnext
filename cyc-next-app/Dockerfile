# syntax=docker/dockerfile:1

FROM node:17.7.1

ENV NODE_ENV=production
ENV PORT 80

WORKDIR /app

COPY . /app

RUN npm install --production
RUN npm run build
RUN npm run start


