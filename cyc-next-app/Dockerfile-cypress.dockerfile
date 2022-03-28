FROM cypress/included:9.5.2

ENV CYPRESS_VIDEO=false

WORKDIR /app

COPY ./cypress /cypress
COPY ./cypress.json ./cypress.json

RUN npx cypress run --headless --browser chrome

