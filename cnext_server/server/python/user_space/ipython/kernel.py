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
        self.km = None
        self.kc = None
        self.message_handler_callback = None
        self.msg_threads = []
        self.stream_types = [IPythonConstants.StreamType.SHELL,
                             IPythonConstants.StreamType.IOBUF, IPythonConstants.StreamType.STDIN]
        self.execute_lock = threading.Lock()
        self._set_execution_complete_condition(False)

    def start_msg_thead(self):
        for type in self.stream_types:
            self.msg_threads.append(threading.Thread(
                target=self.handle_ipython_stream, args=(type,), daemon=True))
            self.msg_threads[-1].start()

    def stop_msg_thread(self):
        self.stop_msg_thread_signal = True
        # wait to make sure the stream threads will stop before proceeding
        while self.is_msg_thead_alive():
            time.sleep(1)
        self.stop_msg_thread_signal = False

    def is_msg_thead_alive(self):
        for msg_thread in self.msg_threads:
            if msg_thread.is_alive():
                return True
        return False

    def start_kernel(self, kernel_name: str):
        try:
            if self.km is not None:
                self.shutdown_kernel()
            self.stop_msg_thread()
            log.info('Kernel starting')
            self.km = jupyter_client.KernelManager(kernel_name=kernel_name)
            self.km.start_kernel()
            self.kc = self.km.blocking_client()
            self.wait_for_ready()
            self.start_msg_thead()

            log.info('Kernel started')

            # release execution lock which might be locked during an execution
            if self.execute_lock.locked():
                self.execute_lock.release()
                log.info('Kernel execution lock released')
                self._set_execution_complete_condition(True)
            if self.km.is_alive():
                return True
            else:
                return False
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def shutdown_kernel(self):
        try:
            if self.km.is_alive():
                log.info('Kernel shutting down')
                self.kc.stop_channels()
                self.km.shutdown_kernel(now=True)
                log.info('Kernel shutdown')
                if not self.km.is_alive():
                    return True
                else:
                    return False
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def restart_kernel(self):
        try:
            # if self.km.is_alive():
            log.info('Kernel restarting')
            self.km.restart_kernel()
            self.stop_msg_thread()
            self.kc = self.km.blocking_client()
            result = self.wait_for_ready()
            log.info("wait_for_ready return: %s", result)
            self.start_msg_thead()
            log.info('Kernel restarted')

            # release execution lock which might be locked during an execution
            if self.execute_lock.locked():
                self.execute_lock.release()
                log.info('Kernel execution lock released')
                self._set_execution_complete_condition(True)

            if self.km.is_alive():
                return True
            else:
                return False
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def interrupt_kernel(self):
        try:
            if self.km.is_alive():
                self.km.interrupt_kernel()
                log.info('Kerel interrupted')
            return True
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
        return False

    def is_alive(self):
        return self.kc.is_alive() if self.kc else False

    def wait_for_ready(self, timeout=100):
        try:
            self.kc.wait_for_ready(timeout=timeout)
            return True
        except RuntimeError:
            # self.shutdown_kernel()
            return False
            
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
            while not self.stop_msg_thread_signal:
                try:
                    ipython_message = None
                    if stream_type == IPythonConstants.StreamType.SHELL:
                        ipython_message = self.kc.get_shell_msg(
                            timeout=MESSSAGE_TIMEOUT)
                    elif stream_type == IPythonConstants.StreamType.IOBUF:
                        ipython_message = self.kc.get_iopub_msg(
                            timeout=MESSSAGE_TIMEOUT)
                    elif stream_type == IPythonConstants.StreamType.STDIN:
                        ipython_message = self.kc.get_stdin_msg(
                            timeout=MESSSAGE_TIMEOUT)

                    if ipython_message['header']['msg_type'] != "stream":
                        log.info('%s msg: msg_type = %s, content = %s' % (
                            stream_type, ipython_message['header']['msg_type'], ipython_message['content']))
                    else:
                        log.info('%s msg: msg_type = %s' % (
                            stream_type, ipython_message['header']['msg_type']))

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
                except:
                    trace = traceback.format_exc()
                    log.info("Exception %s" % (trace))
                    if self.execute_lock.locked():
                        self.execute_lock.release()                        
                        log.info('Kernel execution lock released')
            log.info('Stop stream %s' % stream_type)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def execute(self, code, exec_mode=None, message_handler_callback=None, client_message=None):
        try:
            if self.kc:
                self.execute_lock.acquire()
                log.info(
                    'Kernel execution lock acquired for executing \n"""\n%s ...\n"""', code[:50])
                self._set_execution_complete_condition(False)
                self.message_handler_callback = message_handler_callback
                self.client_message = client_message
                self.kc.execute(code)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))

    def send_stdin(self, input_text):
        try:
            if self.kc:
                log.info('Send stdin input to kernel ')
                self.kc.input(input_text)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
