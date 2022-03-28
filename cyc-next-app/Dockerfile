FROM node:16.13.1

ENV NODE_ENV=production
ENV PORT 80

WORKDIR /web

COPY . /web

RUN npm i --force
RUN npm run build

CMD ["npm", "start"]
