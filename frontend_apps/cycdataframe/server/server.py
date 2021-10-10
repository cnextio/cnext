import sys, logging
logging.basicConfig(filename='./log.txt', filemode='a', format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s', 
                        datefmt='%H:%M:%S', level=logging.DEBUG)
log = logging.getLogger(__name__)

# while True:
#     log.info('reading lines')
#     line = sys.stdin.readline()
#     log.info(line)
#     exec(line)
#     log.info('done')
while True:
    for line in sys.stdin:
        try:
            exec(line)
        except:
            import traceback
            traceback.print_exc()
            sys.stderr.flush()    
        sys.stdout.flush()
        log.info(line[:-1])
