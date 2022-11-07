from libs.constants import TrackingModelType, TrackingDataframeType
from user_space.user_space import ExecutionMode
import simplejson as json
import re
import time

MAX_UNIQUE_LENGTH = 1000


class DataFrameAbstract():
    def __init__(self, user_space, df_id):
        self.user_space = user_space
        self.df_id = df_id

    @staticmethod
    def _is_jsonable(obj):
        try:
            json.dumps(obj)
            return True
        except (TypeError, OverflowError):
            return False

    @staticmethod
    def _convert_to_str_if_not_jsonable(df):
        for c in df.columns:
            for r in df.index:
                if not DataFrameAbstract._is_jsonable(df.at[r, c]):
                    df.at[r, c] = str(df.at[r, c])
        return df
    
    def timeit(func):
        def wrap(*args, **kwargs):
            print(" Executing %s"%func.__name__)            
            start = time.time()
            result = func(*args, **kwargs)
            end = time.time()

            print(' Elapse %.3f(s)'%(end-start))
            return result
        return wrap
    
    @timeit
    def describe(self):
        describe = self.user_space.execute(
            "%s.describe(include='all')" % self.df_id, ExecutionMode.EVAL)
        return self._convert_to_str_if_not_jsonable(describe)

    @timeit
    def countna(self):
        return self.user_space.execute("%s.isna().sum()" % self.df_id, ExecutionMode.EVAL)

    @timeit
    def dtypes(self):
        return self.user_space.execute(
            "%s.dtypes" % self.df_id, ExecutionMode.EVAL)
    
    @timeit
    def nuniques(self):
        return self.user_space.execute(
            "%s.nunique()" % self.df_id, ExecutionMode.EVAL)
    
    def type(self):
        return self.user_space.execute(
            "%s.__module__ + '.' + %s.__class__.__name__" % (self.df_id, self.df_id), ExecutionMode.EVAL)

    def shape(self):
        return self.user_space.execute(
            "%s.shape" % self.df_id, ExecutionMode.EVAL)

    def uniques(self, df_id, dtypes, nuniques):
        uniques = {}
        for col_name, ctype in dtypes.items():
            unique = []
            if nuniques is not None and col_name in nuniques and nuniques[col_name] < MAX_UNIQUE_LENGTH:
                if re.search(r'datetime', ctype.name):
                    # the unique value of datetime is usually the same as the length so it is meaningless
                    # also we have to convert it to string before sending back. So just don't do it now.
                    unique = []
                else:
                    unique = self.user_space.execute(
                        "_pd.Series(%s['%s'].unique()).tolist()" % (df_id, col_name), ExecutionMode.EVAL)
            uniques[col_name] = unique
        return uniques

    def get_table_data(self, filter, from_index, to_index):
        code = "%s%s.iloc[%s:%s]"%(self.df_id, filter, from_index, to_index)
        return self.user_space.execute(code, ExecutionMode.EVAL)

    def get_metadata(self):
        return (self.shape(), self.dtypes(), self.countna(), self.describe(), self.nuniques())

    def get_column_summary(self, dtypes, countna, describe, uniques):
        columns = {}
        for col_name, ctype in dtypes.items():
            columns[col_name] = {'name': col_name,
                                 'type': str(ctype.name),
                                 'unique': uniques[col_name] if uniques is not None and (col_name in uniques) else None,
                                 'countna': countna[col_name].item() if countna is not None and (col_name in countna) else None,
                                 'describe': describe[col_name].to_dict() if describe is not None and (col_name in describe) else None}
        return columns


class PandasDataFrame(DataFrameAbstract):
    """

    """


class DaskDataFrame(DataFrameAbstract):
    """

    """

    @DataFrameAbstract.timeit
    def describe(self):
        ## convert to pandas #
        describe = self.user_space.execute(
            "%s.describe().compute()" % self.df_id, ExecutionMode.EVAL)
        return self._convert_to_str_if_not_jsonable(describe)

    @DataFrameAbstract.timeit
    def countna(self):
        ## convert to pandas #
        return self.user_space.execute(
            "%s.isna().sum().compute()" % self.df_id, ExecutionMode.EVAL)

    @DataFrameAbstract.timeit
    def nuniques(self):
        ## convert to pandas #
        return self.user_space.execute(
            "%s.nunique().compute()" % self.df_id, ExecutionMode.EVAL)

    def shape(self):
        shape = self.user_space.execute(
            "%s.shape" % self.df_id, ExecutionMode.EVAL)
        ## convert to pandas #
        return (shape[0].compute(), shape[1])

    def uniques(self, df_id, dtypes, nuniques):
        uniques = {}
        for col_name, ctype in dtypes.items():
            uniques[col_name] = []
        return uniques

    def get_table_data(self, filter, from_index, to_index):
        code = "%s%s.loc[%s:%s]" % (self.df_id, filter, from_index, to_index)
        daskDF = self.user_space.execute(code, ExecutionMode.EVAL)
        return daskDF.compute()


class SparkPandasDataFrame(DataFrameAbstract):
    """

    """
    @DataFrameAbstract.timeit
    def describe(self):
        describe = self.user_space.execute(
            "%s.describe().to_pandas()" % self.df_id, ExecutionMode.EVAL)
        return self._convert_to_str_if_not_jsonable(describe)

    @DataFrameAbstract.timeit
    def countna(self):
        return self.user_space.execute("%s.isna().sum().to_pandas()" % self.df_id, ExecutionMode.EVAL)
    
    def uniques(self, df_id, dtypes, nuniques):
        uniques = {}
        for col_name, ctype in dtypes.items():
            uniques[col_name] = []
        return uniques

    def get_table_data(self, filter, from_index, to_index):
        sparkDF = DataFrameAbstract.get_table_data(self, filter, from_index, to_index)
        return sparkDF.to_pandas()


def DataFrame(user_space, df_id, type):

    dataframe_implementation = {
        TrackingDataframeType.PANDAS: PandasDataFrame,
        TrackingDataframeType.CNEXT: PandasDataFrame,
        TrackingDataframeType.DASK: DaskDataFrame,
        TrackingDataframeType.SPARK: SparkPandasDataFrame
    }

    return dataframe_implementation[type](user_space, df_id)
