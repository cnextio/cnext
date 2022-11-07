import asyncio
import time
import psutil
from traitlets.config import Configurable
from jupyter_resource_usage.prometheus import PrometheusHandler
from jupyter_resource_usage.metrics import PSUtilMetricsLoader
from jupyter_resource_usage.config import ResourceUseDisplay
import threading
import traceback
import simplejson as json

from libs.message_handler import BaseMessageHandler
from libs.message import Message

from libs import logs
from libs.message import WebappEndpoint
from libs.config import read_config
from libs.zmq_message import MessageQueuePull
from project_manager.interfaces import SERVER_CONFIG_PATH
from libs.message import ExecutorManagerCommand
from project_manager.interfaces import WORKSPACE_METADATA_PATH, WorkspaceMetadata
from server import set_executor_working_dir

log = logs.get_logger(__name__)

RESOUCE_CHECKING_PERIOD = 10  # unit: second
MEM_REPORT_THRESHOLD = 0.05

## This is fake server app used to make the jupyter_resource_usage plugin works #


class ServerApp(Configurable):
    class WebApp:
        settings = {}
    web_app = WebApp()
    session_manager = None


class ResourceStatus:
    alive_status: bool = False
    resource_usage = {"rss": 0., "limit": {}}


class MessageHandler(BaseMessageHandler):
    def __init__(self, p2n_queue, user_space=None):
        super(MessageHandler, self).__init__(p2n_queue, user_space)
        self.resource_status = ResourceStatus()
        
        event_loop = asyncio.get_event_loop()
        ## we have to pass event_loop to the thread otherwise it won't have one #
        executor_manager_thread = threading.Thread(
            target=self.handle_message, args=(event_loop,), daemon=True)
        executor_manager_thread.start()

        server_app = ServerApp()
        resuseconfig = ResourceUseDisplay(parent=server_app)
        server_app.web_app.settings["jupyter_resource_usage_display_config"] = resuseconfig
        self.config = resuseconfig
        self.metrics_manager = PrometheusHandler(
            PSUtilMetricsLoader(server_app))
        executor_status_thread = threading.Thread(
            target=self._update_resouce_usage, daemon=True)
        executor_status_thread.start()

    def _check_resource_threshold(self, alive_status, resource_usage):
        if self.resource_status.alive_status != alive_status:
            self.resource_status.alive_status = alive_status
            return True
        else:
            if self.resource_status.resource_usage["rss"]==0. or ("rss" in resource_usage and abs(resource_usage["rss"]-self.resource_status.resource_usage["rss"])/self.resource_status.resource_usage["rss"] > MEM_REPORT_THRESHOLD):
                self.resource_status.resource_usage = resource_usage
                return True
        return False

    def _update_resouce_usage(self):
        message = Message(**{'webapp_endpoint': WebappEndpoint.ExecutorManager,
                             'command_name': ExecutorManagerCommand.get_status})
        while(True):
            # start_time = time.time()
            alive_status = self.user_space.is_alive()
            self.metrics_manager()
            resource_usage = self._get_resource_usage()
            # log.info('Resource: %s' % resource_usage)
            message.content = {'alive_status': alive_status,
                               'resource_usage': resource_usage}
            if self._check_resource_threshold(alive_status, resource_usage):
                self._send_to_node(message)
            # end_time = time.time()
            # log.info("Time %f" % (end_time-start_time))
            time.sleep(RESOUCE_CHECKING_PERIOD)

    def _get_cpu_percent(self, all_processes):
        def get_cpu_percent(p):
            try:
                return p.cpu_percent(interval=0.05)
            # Avoid littering logs with stack traces complaining
            # about dead processes having no CPU usage
            except:
                return 0

        return sum([get_cpu_percent(p) for p in all_processes])

    def _get_resource_usage(self):
        # self.metrics_manager()
        cur_process = psutil.Process()
        all_processes = [cur_process] + \
            cur_process.children(recursive=True)

        # Get memory information
        rss = 0
        for p in all_processes:
            try:
                rss += p.memory_info().rss
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                pass

        if callable(self.config.mem_limit):
            mem_limit = self.config.mem_limit(rss=rss)
        else:  # mem_limit is an Int
            mem_limit = self.config.mem_limit

        limits = {"memory": {"rss": mem_limit}}
        if self.config.mem_limit and self.config.mem_warning_threshold != 0:
            limits["memory"]["warn"] = (mem_limit - rss) < (
                mem_limit * self.config.mem_warning_threshold
            )

        metrics = {"rss": rss, "limits": limits}

        # Optionally get CPU information
        if self.config.track_cpu_percent:
            cpu_count = psutil.cpu_count()
            cpu_percent = self._get_cpu_percent(all_processes)

            if self.config.cpu_limit != 0:
                limits["cpu"] = {"cpu": self.config.cpu_limit}
                if self.config.cpu_warning_threshold != 0:
                    limits["cpu"]["warn"] = (self.config.cpu_limit - cpu_percent) < (
                        self.config.cpu_limit * self.config.cpu_warning_threshold
                    )

            metrics.update(cpu_percent=cpu_percent, cpu_count=cpu_count)
        return metrics

    def handle_message(self, event_loop):
        log.info("Kernel control thread started")
        asyncio.set_event_loop(event_loop)
        ## reading config here to get the most updated version #
        server_config = read_config(SERVER_CONFIG_PATH)
        n2p_queue = MessageQueuePull(
            server_config.n2p_comm['host'], server_config.n2p_comm['kernel_control_port'])
        try:
            while True:
                strMessage = n2p_queue.receive_msg()
                message = Message(**json.loads(strMessage))
                log.info("Received control message: %s" % message)
                if self.user_space.is_alive():
                    if message.command_name == ExecutorManagerCommand.restart_kernel:
                        result = self.user_space.restart_executor()
                        if result:
                            # get the lastest config to make sure that it is updated with the lastest open project
                            workspace_info = read_config(WORKSPACE_METADATA_PATH)
                            workspace_metadata = WorkspaceMetadata(
                                workspace_info.__dict__)
                            set_executor_working_dir(
                                self.user_space, workspace_metadata)
                        message = Message(**{'webapp_endpoint': WebappEndpoint.ExecutorManagerControl,
                                            'command_name': message.command_name,
                                            'content': {'success': result}})
                    elif message.command_name == ExecutorManagerCommand.interrupt_kernel:
                        result = self.user_space.interrupt_executor()
                        message = Message(**{'webapp_endpoint': WebappEndpoint.ExecutorManagerControl,
                                            'command_name': message.command_name,
                                            'content': {'success': result}})
                    elif message.command_name == ExecutorManagerCommand.get_status:
                        status = self.user_space.is_alive()
                        # resource_usage = self._get_resource_usage()
                        # log.info("Memory usage %s" % resource_usage)
                        message = Message(**{'webapp_endpoint': WebappEndpoint.ExecutorManager,
                                            'command_name': message.command_name,
                                            'content': {'alive': status}})
                        #  'content': {'alive': status, 'resource': resource_usage}})
                    elif message.command_name == ExecutorManagerCommand.send_stdin:
                        self.user_space.send_stdin(message.content)
                        message = Message(**{'webapp_endpoint': WebappEndpoint.ExecutorManager,
                                            'command_name': message.command_name,
                                            'content': {'status': 'done'}})
                    self._send_to_node(message)
                else:
                    text = "No executor running"
                    log.info(text)
                    error_message = BaseMessageHandler._create_error_message(
                        message.webapp_endpoint, text, message.command_name, {})
                    self._send_to_node(error_message)
        except:
            trace = traceback.format_exc()
            log.info("Exception %s" % (trace))
            error_message = BaseMessageHandler._create_error_message(
                message.webapp_endpoint, trace, message.command_name, {})
            self._send_to_node(error_message)

    def shutdown(self):
        self.n2p_queue.close()
        return super().shutdown()
