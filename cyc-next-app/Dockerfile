FROM node:16.13.1

ENV NODE_ENV=production

WORKDIR /web

COPY . .

RUN npm i --force
RUN npm run build

CMD ["npm", "start"]

EXPOSE 3000
