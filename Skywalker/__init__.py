import os, sys, pandas as pd, plotly.express as px, plotly.io as pio
import mlflow, mlflow.tensorflow
from cycdataframe.cycdataframe import CycDataFrame

pio.renderers.default = "json"
# sys.path.append('${config.path_to_cycdataframe_lib}cycdataframe/')
# os.chdir('${config.projects.open_projects[0]['path']}')
