FROM continuumio/anaconda3

WORKDIR /app
COPY . .

ENV CLIENT_URL=http://localhost:3000

RUN conda install -c conda-forge nodejs
RUN conda install -c conda-forge/label/gcc7 nodejs
RUN conda install -c conda-forge/label/cf201901 nodejs
RUN conda install -c conda-forge/label/cf202003 nodejs

RUN npm -version
RUN npm install node
RUN npm install npm@latest 

WORKDIR /app/cyc_next_app
RUN npm i --force
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SERVER_SOCKET_ENDPOINT=http://localhost:4000
RUN npm run build

WORKDIR /app/cyc_next_app/server
RUN npm i

# Install git
RUN conda install -c anaconda git
RUN git clone https://kiwing:QTmTLMdSUT3HPSEQpe7N@bitbucket.org/robotdreamers/cycdataframe.git
RUN git clone -b deploy --single-branch https://kiwing:QTmTLMdSUT3HPSEQpe7N@bitbucket.org/robotdreamers/cnext_sample_projects.git

# Create conda environment
WORKDIR /app
RUN conda env create -f environment.yml
# Activate conda environment
ENV PATH /opt/conda/envs/py39/bin:$PATH
RUN /bin/bash -c "source activate py39"
