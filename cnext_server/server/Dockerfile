FROM python:3.9.7-buster
RUN mkdir app

WORKDIR /app

ENV CLIENT_URL=http://web:4000

RUN chmod -R 777 /app

ENV POETRY_HOME=/usr/local

RUN \
    echo "deb https://deb.nodesource.com/node_16.x buster main" > /etc/apt/sources.list.d/nodesource.list && \
    wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    wget -qO- https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    apt-get update && \
    apt-get install -yqq nodejs && \
    apt-get update && \
    apt-get install git && \
    pip install -U pip && pip install pipenv && \
    npm i -g npm@^8 && \
    curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | python - && \
    rm -rf /var/lib/apt/lists/*

COPY  . .

RUN git clone https://kiwing:QTmTLMdSUT3HPSEQpe7N@bitbucket.org/robotdreamers/cnext_sample_projects.git

#BUILD
RUN /bin/bash -c "poetry install"
RUN /bin/bash -c "npm install"

RUN chmod -R 777 ./start.sh

ENTRYPOINT [ "./start.sh" ]

EXPOSE 4000