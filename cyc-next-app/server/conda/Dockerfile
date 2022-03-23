# #CONDA
FROM continuumio/anaconda3

WORKDIR /home/conda
COPY . .

# Create conda environment
RUN conda env create -f environment.yml

# Activate conda environment
ENV PATH /opt/conda/envs/py39/bin:$PATH
RUN /bin/bash -c "source activate py39"
# RUN conda install -c conda-forge nodejs

# Run python script 
# CMD ["python", "test.py"]