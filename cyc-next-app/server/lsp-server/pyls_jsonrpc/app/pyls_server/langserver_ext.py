import logging
import subprocess
import threading
import traceback
import os
import signal
from tornado import ioloop, process, web, websocket
from pyls_jsonrpc import streams

try:
    import ujson as json
except Exception:  # pylint: disable=broad-except
    import json

logging.basicConfig(filename='./ls.log', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(funcName)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

class LanguageServerWebSocketHandler(websocket.WebSocketHandler):
    """Setup tornado websocket handler to host an external language server."""

    writer = None
    
    def open(self, *args, **kwargs):
        log.info("Spawning pyls subprocess")
        # Create an instance of the language server
        self.proc = process.Subprocess(
            ['pyls', '-v'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            start_new_session=True
        )

        # Create a writer that formats json messages with the correct LSP headers
        self.writer = streams.JsonRpcStreamWriter(self.proc.stdin)

        # Create a reader for consuming stdout of the language server. We need to
        # consume this in another thread
        def consume():
            try:
                # Start a tornado IOLoop for reading/writing to the process in this thread
                ioloop.IOLoop()
                reader = streams.JsonRpcStreamReader(self.proc.stdout)
                reader.listen(lambda msg: self.write_message(json.dumps(msg)))
            except Exception:
                log.error(traceback.format_exc())
                print(traceback.format_exc())

        thread = threading.Thread(target=consume)
        thread.daemon = True
        thread.start()

    def on_message(self, message):
        """Forward client->server messages to the endpoint."""
        # print(message)
        self.writer.write(json.loads(message))
        # self.write_message(u"You said: " + message)

    def check_origin(self, origin):
        return True

    def on_close(self):
        print("Close, terminate process")
        # self.proc.kill()
        os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)

if __name__ == "__main__":
    log.info('Starting the server')
    app = web.Application([
        (r"/python", LanguageServerWebSocketHandler),
    ])
    app.listen(3001, address='0.0.0.0')
    ioloop.IOLoop.current().start()
