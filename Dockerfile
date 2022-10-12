ARG PYTHON_IMAGE="3.9.13-bullseye"

FROM ubuntu:22.04

ARG NODE_VERSION="16"
ARG CNEXT_VERSION

# install packages
RUN set -eux \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
        build-essential curl python3-pip python3-dev

RUN set -eux \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

# Don't run production as root
RUN addgroup --system --gid 1001 cnext
RUN useradd -rm -g cnext -G sudo -u 1001 -s /bin/bash cnext
USER cnext

ENV PATH "$PATH:/home/cnext/.local/bin"

RUN pip install cnext${CNEXT_VERSION:+==$CNEXT_VERSION}
# RUN echo "n" | cnext-init

WORKDIR /home/cnext

RUN mkdir -p sample-projects \
    && curl -OL https://bitbucket.org/robotdreamers/cnext_sample_projects/get/master.tar.gz \
    && tar -xzf master.tar.gz --strip-components 1 -C sample-projects \
    && rm master.tar.gz

# RUN echo "active_project: 0cb1b520-7100-4b7e-a858-d5534b7ba7aa\nopen_projects:\n  - id: 0cb1b520-7100-4b7e-a858-d5534b7ba7aa\n    name: Skywalker\n    path: /home/cnext/sample-projects/Skywalker\n  - id: 76d3ef55-70e1-4155-811f-dc32a989fe43\n    name: Jedi\n    path: /home/cnext/sample-projects/Jedi" > /home/cnext/.local/lib/python3.10/site-packages/cnext_server/server/workspace.yaml

ENV SHELL="/bin/bash"

COPY ./docker/docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["cnext", "-l", "/home/cnext/sample-projects/Skywalker"]
