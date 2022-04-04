FROM continuumio/anaconda3

WORKDIR /server
COPY . /server

# Create conda environment
RUN conda env create -f environment.yml
RUN conda install -c conda-forge nodejs
RUN conda install -c conda-forge/label/gcc7 nodejs
RUN conda install -c conda-forge/label/cf201901 nodejs
RUN conda install -c conda-forge/label/cf202003 nodejs

# Install git
RUN conda install -c anaconda git
RUN git clone https://kiwing:QTmTLMdSUT3HPSEQpe7N@bitbucket.org/robotdreamers/cycdataframe.git
RUN git clone -b deploy --single-branch https://kiwing:QTmTLMdSUT3HPSEQpe7N@bitbucket.org/robotdreamers/cnext_sample_projects.git

RUN npm install

# Activate conda environment
ENV PATH /opt/conda/envs/py39/bin:$PATH
RUN /bin/bash -c "source activate py39"
# Run python script
CMD ["npm", "start"]
# Run python script 
# CMD ["python", "test.py"]

EXPOSE 4000