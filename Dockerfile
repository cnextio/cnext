ARG PYTHON_IMAGE="3.9.13-bullseye"

FROM python:${PYTHON_IMAGE}

ARG NODE_VERSION="16"
ARG CNEXT_VERSION

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

# Don't run production as root
RUN addgroup --system --gid 1001 cnext
RUN useradd -rm -g cnext -G sudo -u 1001 cnext
USER cnext

ENV PATH "$PATH:/home/cnext/.local/bin"

RUN pip install cnext${CNEXT_VERSION:+==$CNEXT_VERSION}
RUN echo "n" | cnext-init

COPY ./docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["cnext-run"]
