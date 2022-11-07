class TrackingModelType:
    PYTORCH_NN = "torch.nn.Module"
    TENSORFLOW_KERAS = "tensorflow.keras.Model"


class TrackingDataframeType:
    PANDAS = "pandas.core.frame.DataFrame"
    CNEXT = "cnextlib.dataframe.DataFrame"
    DASK = "dask.dataframe.core.DataFrame"
    SPARK = "pyspark.pandas.frame.DataFrame"
