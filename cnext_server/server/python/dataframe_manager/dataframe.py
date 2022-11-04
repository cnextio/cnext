from libs.constants import TrackingModelType, TrackingDataframeType
from user_space.user_space import ExecutionMode
import simplejson as json


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
            for r in df.index.to_numpy():
                if not DataFrameAbstract._is_jsonable(df.at[r, c]):
                    df.at[r, c] = str(df.at[r, c])
        return df


class PandasDataFrame(DataFrameAbstract):
    """

    """

    # def __init__(self, user_space, df_id):
    #     self.user_space = user_space
    #     self.df_id = df_id

    def describe(self):
        describe = self.user_space.execute("%s.describe(include='all')" % self.df_id, ExecutionMode.EVAL)
        return self._convert_to_str_if_not_jsonable(describe)

    def countna(self):
        return self.user_space.execute("%s.isna().sum()" % self.df_id, ExecutionMode.EVAL)

    def dtypes(self):
        return self.user_space.execute(
            "%s.dtypes" % self.df_id, ExecutionMode.EVAL)

    def nuniques(self):
        return self.user_space.execute(
            "%s.nunique()" % self.df_id, ExecutionMode.EVAL)

    def type(self):
        return self.user_space.execute(
            "%s.__module__ + '.' + %s.__class__.__name__" % (self.df_id, self.df_id), ExecutionMode.EVAL)

    def shape(self):
        return self.user_space.execute(
            "%s.shape" % self.df_id, ExecutionMode.EVAL)

    def uniques(self, dtypes, nuniques):
        uniques = {}
        for col_name, ctype in dtypes.items():
            unique = []
            if nuniques[col_name] < MAX_UNIQUE_LENGTH:
                if re.search(r'datetime', ctype.name):
                    # the unique value of datetime is usually the same as the length so it is meaningless
                    # also we have to convert it to string before sending back. So just don't do it now.
                    unique = []
                else:
                    unique = self.user_space.execute(
                        "_pd.Series(%s['%s'].unique()).tolist()" % (df_id, col_name), ExecutionMode.EVAL)
            uniques[col_name] = unique
        return uniques

    def get_table_data(self, code):
        return self.user_space.execute(code, ExecutionMode.EVAL)

    def get_metadata(self):
        return (self.shape(), self.dtypes(), self.countna(), self.describe(), self.nuniques())


class SparkPandasDataFrame(DataFrameAbstract):
    """

    """

    # def __init__(self, user_space, df_id):
    #     self.user_space = user_space
    #     self.df_id = df_id

    def describe(self):
        describe = self.user_space.execute(
            "%s.describe()" % self.df_id, ExecutionMode.EVAL)
        return self._convert_to_str_if_not_jsonable(describe)

    def countna(self):
        return self.user_space.execute("%s.isna().sum()" % self.df_id, ExecutionMode.EVAL)

    def dtypes(self):
        return self.user_space.execute(
            "%s.dtypes" % self.df_id, ExecutionMode.EVAL)

    def nuniques(self):
        return self.user_space.execute(
            "%s.nunique()" % self.df_id, ExecutionMode.EVAL)

    def type(self):
        return self.user_space.execute(
            "%s.__module__ + '.' + %s.__class__.__name__" % (self.df_id, self.df_id), ExecutionMode.EVAL)

    def shape(self):
        return self.user_space.execute(
            "%s.shape" % self.df_id, ExecutionMode.EVAL)

    def uniques(self, dtypes, nuniques):
        uniques = {}
        for col_name, ctype in dtypes.items():
            unique = []
        #     if nuniques[col_name] < MAX_UNIQUE_LENGTH:
        #         if re.search(r'datetime', ctype.name):
        #             # the unique value of datetime is usually the same as the length so it is meaningless
        #             # also we have to convert it to string before sending back. So just don't do it now.
        #             unique = []
        #         else:
        #             unique = self.user_space.execute(
        #                 "_pd.Series(%s['%s'].unique()).tolist()" % (df_id, col_name), ExecutionMode.EVAL)
            uniques[col_name] = unique
        return uniques

    def get_table_data(self, code):
        sparkDF = self.user_space.execute(code, ExecutionMode.EVAL)

        return sparkDF.to_pandas()

    def get_metadata(self):
        return (self.shape(), self.dtypes(), self.countna(), self.describe(), self.nuniques())


def DataFrame(user_space, df_id, type):

    dataframe_implementation = {
        TrackingDataframeType.PANDAS: PandasDataFrame,
        TrackingDataframeType.SPARK: SparkPandasDataFrame
    }

    return dataframe_implementation[type](user_space, df_id)
