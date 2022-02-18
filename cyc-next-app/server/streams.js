class JsonRpcStreamReader {
  
    getData(data) {
        const messages = data.toString('utf-8').split('\n');
        let jsonObjStr;
        for (let i = 0; i < messages.length; i++) {
            try {
                jsonObjStr = JSON.parse(messages[i]);
                break;
            } catch (error) {}
        }
        return jsonObjStr?.result;
    }
}

class JsonRpcStreamWriter {

    getPayload(message){
        const length = message.length;
        return `Content-Length: ${length}\r\n Content-Type: application/vscode-jsonrpc; charset=utf8\r\n\r\n${message}`;
    };
}

module.exports = {
    JsonRpcStreamReader,
    JsonRpcStreamWriter,
};
