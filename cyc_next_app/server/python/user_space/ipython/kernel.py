import threading
import time
import traceback
import jupyter_client
import queue
from user_space.ipython.constants import IPythonConstants
from libs import logs
log = logs.get_logger(__name__)

MESSSAGE_TIMEOUT = 1

class IPythonKernel():
    def __init__(self):
        self.km = jupyter_client.KernelManager()
        self.km.start_kernel()
        self.kc = self.km.blocking_client()
        self.wait_for_ready()

        self.stop_stream_thread = False
        self.shell_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.SHELL,), daemon=True)
        self.iobuf_msg_thread = threading.Thread(
            target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.IOBUF,), daemon=True)
        self.shell_msg_thread.start()
        self.iobuf_msg_thread.start()

        self.message_handler_callback = None
        ## This lock is used to make sure only one execution is being executed at any moment in time #
        self.execute_lock = threading.Lock()
        self._set_execution_complete_condition(False)

    def shutdown_kernel(self):
        try:
            if self.km.is_alive():
                log.info('Kernel shutting down')
                self.kc.stop_channels()
                self.km.shutdown_kernel(now=True)
                log.info('Kernel shutdown')
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def restart_kernel(self):
        try:
            if self.km.is_alive():
                log.info('Kernel restarting')
                self.km.restart_kernel()
                self.stop_stream_thread = True
                self.kc = self.km.blocking_client()
                self.wait_for_ready()
                # wait to make sure the stream threads will stop before proceeding
                while self.shell_msg_thread.is_alive() or self.shell_msg_thread.is_alive():
                    time.sleep(1)
                self.shell_msg_thread = threading.Thread(
                    target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.SHELL,), daemon=True)
                self.iobuf_msg_thread = threading.Thread(
                    target=self.handle_ipython_stream, args=(IPythonConstants.StreamType.IOBUF,), daemon=True)
                self.stop_stream_thread = False
                self.shell_msg_thread.start()
                self.iobuf_msg_thread.start()
                log.info('Kernel restarted')

                # release execution lock which might be locked during an execution
                if self.execute_lock.locked():
                    self.execute_lock.release()
                    log.info('Kernel execution lock released')
                    self._set_execution_complete_condition(True)
                return True
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def interrupt_kernel(self):
        try:
            if self.km.is_alive():
                self.km.interrupt_kernel()
                log.info('Interupt kernel')
            return True
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def wait_for_ready(self):
        try:
            self.kc.wait_for_ready(timeout=50)
        except RuntimeError:
            self.shutdown_kernel()

    def _is_status_message(self, message):
        return message['header']['msg_type'] == 'status'

    def _set_execution_complete_condition(self, condition: bool):
        self.shell_cond = condition
        self.iobuf_cond = condition

    def _set_execution_complete_condition_from_message(self, stream_type, message):
        if stream_type == IPythonConstants.StreamType.SHELL:
            self.shell_cond = message['header']['msg_type'] == 'execute_reply' and 'status' in message['content']
        if stream_type == IPythonConstants.StreamType.IOBUF:
            self.iobuf_cond = message['header']['msg_type'] == 'status' and message['content']['execution_state'] == 'idle'

    def _is_execution_complete(self, stream_type, message) -> bool:
        ## Look at the shell stream and check the status #
        return self.shell_cond and self.iobuf_cond

    def handle_ipython_stream(self, stream_type: IPythonConstants.StreamType):
        try:
            log.info('Start stream %s' % stream_type)
            while not self.stop_stream_thread:
                try:
                    ipython_message = None
                    if stream_type == IPythonConstants.StreamType.SHELL:
                        ipython_message = self.kc.get_shell_msg(
                            timeout=MESSSAGE_TIMEOUT)
                    elif stream_type == IPythonConstants.StreamType.IOBUF:
                        ipython_message = self.kc.get_iopub_msg(
                            timeout=MESSSAGE_TIMEOUT)

                    if 'status' in ipython_message['content']:
                        log.info('%s msg: msg_type = %s, status = %s' % (
                            stream_type, ipython_message['header']['msg_type'], ipython_message['content']['status']))
                    elif ipython_message['header']['msg_type'] == 'status' or ipython_message['header']['msg_type'] == 'error':
                        log.info('%s msg: msg_type = %s, content = %s' % (
                            stream_type, ipython_message['header']['msg_type'], ipython_message['content']))
                    else:
                        log.info('%s msg: msg_type = %s' % (
                            stream_type, ipython_message['header']['msg_type']))
                        # log.info('%s msg: msg_type = %s msg_content = %s' % (
                        #     stream_type, ipython_message['header']['msg_type'], ipython_message['content']))

                    if ipython_message is not None and self.message_handler_callback is not None:
                        self.message_handler_callback(
                            ipython_message, stream_type, self.client_message)

                    ## unlock execute lock only after upstream has processed the data if messge is status #
                    # if self._is_status_message(ipython_message) and ipython_message['content']['execution_state'] != 'busy' and self.execute_lock.locked():
                    #     self.execute_lock.release()
                    self._set_execution_complete_condition_from_message(
                        stream_type, ipython_message)
                    if self.execute_lock.locked() and self._is_execution_complete(stream_type, ipython_message):
                        self.execute_lock.release()
                        log.info('Kernel execution lock released')
                except queue.Empty:
                    pass
            log.info('Stop stream %s' % stream_type)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def execute(self, code, exec_mode=None, message_handler_callback=None, client_message=None):
        self.execute_lock.acquire()
        log.info('Kernel execution lock acquired')
        self._set_execution_complete_condition(False)
        self.message_handler_callback = message_handler_callback
        self.client_message = client_message
        self.kc.execute(code)
