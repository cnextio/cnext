# Test websocket aliveness using browser
function ping(ip) {
  var ws = new WebSocket("ws://" + ip);
  ws.onerror = function(e){
    console.log("down")
    ws = null;
  };
  setTimeout(function() { 
    if(ws != null) {
      ws.close();
      ws = null;
      console.log("up")
    }
  },2000);
}