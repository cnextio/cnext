import logging

logging.basicConfig(filename='./server.log', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
logging.getLogger('asyncio').setLevel(logging.WARNING)

def get_logger(name):
    return logging.getLogger(name)