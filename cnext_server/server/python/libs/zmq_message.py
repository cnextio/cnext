import zmq


# from libs import logs
# log = logs.get_logger(__name__)
# class MessageQueue:
#     def __init__(self, host: str, port: int, type=MessageQueueType.PULL, hwm=1000):
#         context = zmq.Context()
#         self.host = host
#         self.port = port
#         self.addr = '{}:{}'.format(host, port)
#         if type == MessageQueueType.PUSH:
#             self.push: zmq.Socket = context.socket(zmq.PUSH)
#             self.push.connect(self.addr)
#         elif type == MessageQueueType.PULL:
#             self.pull: zmq.Socket = context.socket(zmq.PULL)
#             self.pull.connect(self.addr)

#     def get_socket(self):
#         return self.push

#     def send(self, message):
#         # TODO: could not explain why NOBLOCK would not work even when the receiver already connects
#         # TODO: and calls `receive` command
#         # res = self.push_queue.send_json(message)#, flags=zmq.NOBLOCK)
#         res = self.push.send_string(message)
#         return res

#     def close(self):
#         self.pull_queue.disconnect(self.addr)

#     def receive_msg(self):
#         return self.pull.recv()


from libs.config import read_config
from project_manager.interfaces import SERVER_CONFIG_PATH
config = read_config(SERVER_CONFIG_PATH, {'code_executor_comm': {
    'host': '127.0.0.1', 'n2p_port': 5001, 'p2n_port': 5002}})


class MessageQueuePush:
    def __init__(self, host, port, hwm=1000):
        self.context = zmq.Context()
        self.host = host
        self.port = port
        self.addr = '{}:{}'.format(self.host, self.port)
        self.push: zmq.Socket = self.context.socket(zmq.PUSH)
        self.push.connect(self.addr)

    def get_socket(self):
        return self.push

    def close(self):
        self.push.disconnect(self.addr)
        # self.context.term()

    def send(self, message):
        # TODO: could not explain why NOBLOCK would not work even when the receiver already connects
        # TODO: and calls `receive` command
        # res = self.push_queue.send_json(message)#, flags=zmq.NOBLOCK)
        res = self.push.send_string(message)
        return res


class MessageQueuePull:
    def __init__(self, host, port):
        self.context = zmq.Context()
        self.context.setsockopt(zmq.LINGER, 0)
        self.host = host
        self.port = port
        self.addr = '{}:{}'.format(self.host, self.port)
        self.pull: zmq.Socket = self.context.socket(zmq.PULL)
        self.pull.bind(self.addr)

    def close(self):
        self.pull.unbind(self.addr)
        # self.context.term()

    def receive_msg(self):
        return self.pull.recv_string()
