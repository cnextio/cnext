# # #CONDA
# FROM conda as conda
# ENV PORT 80
# WORKDIR /home/conda
# COPY . .

# FROM node:16.13.1
# WORKDIR /home/conda
# COPY --from=conda /home/conda /home/conda
# COPY . .
# ENV PATH /opt/conda/envs/py39/bin:$PATH
# RUN /bin/bash -c "source activate py39"
# RUN npm install
# # Run python script
# # CMD ["npm", "start"]
# CMD ["python", "test.py"]

# #CONDA
FROM continuumio/anaconda3

WORKDIR /app
COPY . .

# Create conda environment
RUN conda env create -f environment.yml
RUN conda install -c conda-forge nodejs
RUN conda install -c conda-forge/label/gcc7 nodejs
RUN conda install -c conda-forge/label/cf201901 nodejs
RUN conda install -c conda-forge/label/cf202003 nodejs
RUN npm install

# Activate conda environment
ENV PATH /opt/conda/envs/py39/bin:$PATH
RUN /bin/bash -c "source activate py39"
# RUN conda install -c conda-forge nodejs
# Run python script
CMD ["npm", "start"]
# Run python script 
# CMD ["python", "test.py"]