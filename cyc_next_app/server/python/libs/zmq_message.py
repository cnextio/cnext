import zmq
from libs import logs

# log = logs.get_logger(__name__)

class MessageQueue:
    def __init__(self, host: str, port: int, hwm=1000):
        context = zmq.Context()
        self.host = host
        self.port = port
        self.addr = '{}:{}'.format(host, port)
        self.pub: zmq.Socket = context.socket(zmq.PUSH)            
        self.pub.connect(self.addr)

    def get_socket(self):    
        return self.pub

    def send(self, message):
        # TODO: could not explain why NOBLOCK would not work even when the receiver already connects
        # TODO: and calls `receive` command
        # res = self.push_queue.send_json(message)#, flags=zmq.NOBLOCK)
        res = self.pub.send_string(message)
        return res

    def close(self):
        self.pull_queue.disconnect(self.addr)

# class MessageQueue:
#     def __init__(self, host: str, port: int, hwm=1000, is_producer=True):
#         context = zmq.Context()
#         self.host = host
#         self.port = port
#         self.addr = '{}:{}'.format(host, port)
#         self.is_producer = is_producer
#         if is_producer:
#             self.push_queue: zmq.Socket = context.socket(zmq.PUSH)
#             # self.push_queue.setsockopt(zmq.SNDHWM, 5)
#             # log.info("ZMQ option: %s" % self.push_queue.hwm)             
#             self.push_queue.bind(self.addr)
#         else:
#             self.pull_queue: zmq.Socket = context.socket(zmq.PULL)
#             self.pull_queue.connect(self.addr)


#     def get_socket(self):    
#         return self.push_queue

#     def push(self, message):
#         if self.is_producer:
#             # TODO: could not explain why NOBLOCK would not work even when the receiver already connects
#             # TODO: and calls `receive` command
#             # res = self.push_queue.send_json(message)#, flags=zmq.NOBLOCK)
#             res = self.push_queue.send_string(message)
#             return res
#         else:
#             return zmq.ENOTSUP

#     def pull(self):
#         if not self.is_producer:
#             res = self.pull_queue.recv_json()
#             return res
#         else:
#             return zmq.ENOTSUP

#     def close(self):
#         if self.is_producer:
#             pass
#             self.push_queue.unbind(self.addr)
#         else:
#             pass
#             self.pull_queue.disconnect(self.addr)