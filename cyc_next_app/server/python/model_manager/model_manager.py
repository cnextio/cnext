import os
import tempfile
import threading
import traceback
import socket
import netron
import tensorflow, torch

from libs.message_handler import BaseMessageHandler
from libs import logs
from libs.message import Message, WebappEndpoint, ModelManagerCommand
from model_manager.interfaces import ModelInfo
from user_space.ipython.constants import IPythonConstants
log = logs.get_logger(__name__)


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue,  user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        self.execution_lock = threading.Lock()
        sock = socket.socket()
        sock.bind(('', 0))
        self.netron_port = sock.getsockname()[1]
        self.netron_host = 'localhost'
        self.netron_tmp_dir = tempfile.gettempdir()

    @classmethod
    def _fullname(cls, klass):
        module = klass.__module__
        if module == 'builtins':
            return klass.__qualname__
        return module + '.' + klass.__qualname__

    def _complete_execution_message(self, message) -> bool:
        return message['header']['msg_type'] == 'execute_reply' and 'status' in message['content']

    def _message_handler_callback(self, ipython_message, stream_type, client_message):
        try:
            log.info('%s msg: %s %s' % (
                stream_type, ipython_message['header']['msg_type'], ipython_message['content']))
            if self._complete_execution_message(ipython_message) and self.execution_lock.locked():
                self.execution_status = ipython_message['content']['status']
                self.execution_lock.release()
                log.info('Execution unlocked')
            else:
                # TODO: log everything else
                log.info('Other messages: %s' % ipython_message)
        except:
            # this is internal exception, we won't send it to the client
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def _complete_waiting_execution(func):
        '''
        Wrapper to block the execution until the execution complete
        '''
        def _complete_waiting_execution_wrapper(*args, **kwargs):
            args[0].execution_lock.acquire()
            log.info('Execution locked')
            result = func(*args, **kwargs)
            args[0].execution_lock.acquire()
            args[0].execution_lock.release()
            return {'status': args[0].execution_status, 'result': result}
        return _complete_waiting_execution_wrapper
    
    @_complete_waiting_execution
    def _save_model(self, modelInfo: ModelInfo):
        MODEL_PATH = None
        if modelInfo.base_class == self._fullname(tensorflow.keras.Model):
            MODEL_PATH = os.path.join(
                self.netron_tmp_dir, '{}.h5'.format(modelInfo.name))
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)
            code = '{}.save("{}")'.format(modelInfo.name, MODEL_PATH)
            self.user_space.execute(code, None, self._message_handler_callback)
        elif modelInfo.base_class == self._fullname(torch.nn.Module):
            MODEL_PATH = os.path.join(
                self.netron_tmp_dir, '{}.onnx'.format(modelInfo.name))
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)
            code = 'torch.onnx.export({}, {}.createInput(), f="{}", training=False)'.format(
                modelInfo.name, modelInfo.name, MODEL_PATH)
            self.user_space.execute(code, None, self._message_handler_callback)
        return MODEL_PATH

    def _display_model(self, modelInfo: ModelInfo):
        # torch.nn.Module, tensorflow.keras.Model        
        output = self._save_model(modelInfo)
        # log.info("Code to run: {}".format(code))
        if output['status'] == IPythonConstants.IOBufMessageStatus.OK:
            MODEL_PATH = output['result']
            address = (self.netron_host, self.netron_port)
            # netron.stop(address)
            # netron.start(MODEL_PATH, address, browse=False)
            return {'address': address}

    def handle_message(self, message):
        # send_reply = False
        # message execution_mode will always be `eval` for this sender
        log.info('Got message %s' % message)
        # log.info('Globals: %s' % client_globals)

        ## this step is important to make sure the query work properly in the backend #
        if (isinstance(message.content, str)):
            message.content = message.content.replace("'", '"')

        try:
            if message.command_name == ModelManagerCommand.get_active_models_info:
                active_models_info = self.user_space.get_active_models_info()
                active_models_info_message = Message(**{"webapp_endpoint": WebappEndpoint.ModelManager, "command_name": message.command_name,
                                                        "seq_number": 1, "type": "dict", "content": active_models_info, "error": False})
                self._send_to_node(active_models_info_message)
            if message.command_name == ModelManagerCommand.display_model:
                modelInfo = ModelInfo(**message.content)
                display_info = self._display_model(modelInfo)
                display_info_message = Message(**{"webapp_endpoint": WebappEndpoint.ModelManager, "command_name": message.command_name,
                                                  "seq_number": 1, "type": "dict", "content": display_info, "error": False})
                self._send_to_node(display_info_message)

        except:
            trace = traceback.format_exc()
            log.error("%s" % (trace))
            error_message = MessageHandler._create_error_message(
                message.webapp_endpoint, trace)
            self._send_to_node(error_message)
