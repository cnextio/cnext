
const { JsonRpcStreamReader, JsonRpcStreamWriter } = require('./streams');
const { spawn, exec } = require('child_process');
// action channel
const LanguageServer = 'LanguageServer';
const LanguageServerNotifier = 'LanguageServerNotifier';
const NotifyCase = ['textDocument/publishDiagnostics'];
class LSPProcess {
    constructor(io) {

        this.ls = spawn('pyls', ['-v']);
        const reader = new JsonRpcStreamReader(this.ls.stdout);

        this.ls.stdout.on('data', (chunk) => {
            const payload = reader.getData(chunk);
            if (payload && payload.result){ 
                io.emit(LanguageServer, JSON.stringify(payload.result))
                reader.clearCache();
            }
            else if (this.isNeedNotify(payload)) {
                io.emit(LanguageServerNotifier, JSON.stringify(payload));
            }
        });
    }

    isNeedNotify(payload){
        return payload && payload.method && NotifyCase.includes(payload.method)
    };

    sendMessageToLsp(message) {
        const writer = new JsonRpcStreamWriter();
        const lspPayload = writer.getPayload(message);
        this.ls.stdin.write(lspPayload);
    }
}
module.exports = {
    LSPProcess,
    LanguageServer,
};



