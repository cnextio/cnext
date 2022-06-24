FROM node:16.13.1

ENV NODE_ENV=production
ENV NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT=http://server:4000

WORKDIR /web

COPY . .

RUN npm i --force
RUN npm run build

CMD ["npm", "start"]

EXPOSE 3000
