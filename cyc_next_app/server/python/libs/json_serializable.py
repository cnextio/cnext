import simplejson as json


class JsonSerializable:
    def __init__(self, obj):
        self.obj = obj

    def toJSON(self):
        return json.dumps(self.obj, ignore_nan=True)

    def __repr__(self) -> str:
        return self.toJSON()


def ipython_internal_output(func):
    '''
    Wrapper to return JsonSerializable instead of original object when return result inside ipython
    '''
    def json_serializable_output(*args, **kwargs):
        output = func(*args, **kwargs)
        return JsonSerializable(output)
    return json_serializable_output
