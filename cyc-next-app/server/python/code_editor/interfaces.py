import simplejson as json


class PlotResult:
    """A class that represents the plot result"""

    def __init__(self, plot):
        self.plot = plot

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, ignore_nan=True)
