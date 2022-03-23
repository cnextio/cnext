FROM node:16.13.1

ENV NODE_ENV=production
ENV PORT 80

WORKDIR /app

COPY . /app

RUN npm i --force
RUN npm run build

CMD ["npm", "start"]
