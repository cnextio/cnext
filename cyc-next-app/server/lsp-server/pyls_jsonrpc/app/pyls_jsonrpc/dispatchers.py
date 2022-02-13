# Copyright 2018 Palantir Technologies, Inc.
import functools
import re
import logging

_RE_FIRST_CAP = re.compile('(.)([A-Z][a-z]+)')
_RE_ALL_CAP = re.compile('([a-z0-9])([A-Z])')

logging.basicConfig(filename='./ls.log', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

class MethodDispatcher(object):
    """JSON RPC dispatcher that calls methods on itself.

    Method names are computed by converting camel case to snake case, slashes with double underscores, and removing
    dollar signs.
    """

    def __getitem__(self, item):
        method_name = 'm_{}'.format(_method_to_string(item))
        if hasattr(self, method_name):
            method = getattr(self, method_name)            
            @functools.wraps(method)
            def handler(params):
                return method(**(params or {}))

            return handler
        raise KeyError()

    # def textDocument/didChange


def _method_to_string(method):
    return _camel_to_underscore(method.replace("/", "__").replace("$", ""))


def _camel_to_underscore(string):
    s1 = _RE_FIRST_CAP.sub(r'\1_\2', string)
    return _RE_ALL_CAP.sub(r'\1_\2', s1).lower()
