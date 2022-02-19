class JsonRpcStreamReader {
  
    getData(data) {
        const messages = data.toString('utf-8').split('\n');
        try {
            return JSON.parse(messages[messages.length - 1]);
        } catch (error) {
            return null;
        }
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
