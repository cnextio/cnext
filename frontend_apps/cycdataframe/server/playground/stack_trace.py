import traceback, sys

try:
    eval('d = long_df')
except:
    traceback.print_exc()
    print(sys.exc_info())

try:
    eval('long_df_')
except:
    traceback.print_exc()    
    print(sys.exc_info())