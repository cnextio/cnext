ARG PYTHON_IMAGE="3.9.13-bullseye"

FROM python:${PYTHON_IMAGE}

ARG NODE_VERSION="16"
ARG CNEXT_VERSION

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

RUN pip install cnext${CNEXT_VERSION:+==$CNEXT_VERSION}
RUN echo "n" | cnext-init

COPY ./docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["cnext-run"]
