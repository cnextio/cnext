FROM cypress/included:9.5.2

ENV CYPRESS_VIDEO=false
ENV CYPRESS_baseUrl=http://web:80

WORKDIR /cypress

COPY . /cypress
# COPY ./cypress.json ./cypress.json

RUN npx cypress run --headless --browser chrome

