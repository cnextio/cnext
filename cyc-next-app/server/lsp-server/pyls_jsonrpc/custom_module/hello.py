""" Testing out pyls with custom functions """
import binascii

def unhex(hex_data):
    """Do unhex``.

    :param str hex_data: Data in hexadecimal string

    """
    return binascii.unhexlify(hex_data)

def summation(a,b):
    """Add 2 int.

    :param int a: first value
    :param int b: second value

    """
    return a+b


def nodefunction(node, foo):
    """Do something with a ``node``.

    :type node: ProgramNode
    :param str foo: foo parameter description

    """
    return "helloworld"