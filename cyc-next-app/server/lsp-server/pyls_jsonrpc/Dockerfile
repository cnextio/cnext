FROM python:3.9-buster
# Define working directory as /app
WORKDIR /app
# Copy source files to start pyls
COPY ./app /app
# Copy custom modules for pyls to register in env.
COPY ./custom_module /usr/local/lib/python3.9/site-packages
# Pip install the requirements
RUN pip install -r ./requirements.txt
# Start the pyls instance over a web socket with tornado
CMD ["python", "/app/pyls_server/langserver_ext.py"]

