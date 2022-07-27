import logging

logging.basicConfig(filename='./server.log', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)

def get_logger(name):
    return logging.getLogger(name)