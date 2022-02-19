
const { JsonRpcStreamReader, JsonRpcStreamWriter } = require('./streams');
const { spawn } = require('child_process');
// action channel
const LspManager = 'LspManager';
const LspManagerNotify = "LspManagerNotify";
const NotifyCase = ['textDocument/publishDiagnostics'];

class LspProcess {
    constructor(io) {
        this.ls = spawn('pyls', ['-v']);
        this.ls.stdout.on('data', (data) => {
            const reader = new JsonRpcStreamReader();
            const payload = reader.getData(data);
            //const channel = this.getChannel(payload);
            if (payload && payload.result) io.emit(LspManager, JSON.stringify(payload.result));
            else if (this.isNeedNotify(payload)) {
                io.emit(LspManagerNotify, JSON.stringify(payload));
            }
        });

        this.ls.stderr.on('data', (data) => {});
    }

    isNeedNotify(payload){
        return payload && payload.method && NotifyCase.includes(payload.method)
    };

    sendMessageToLsp(message) {
        const writer = new JsonRpcStreamWriter();
        const lspPayload = writer.getPayload(message);
        this.ls.stdin.write(lspPayload);
    }

    getChannel(payload) {
        try {
            const method = JSON.parse(payload);
            console.log(method);
            switch (method) {
                case '':
                default:
            }
        } catch (error) {
            console.log('error on LspProcess', error);
        }
    }
}
module.exports = {
    LspProcess,
    LspManager,
};
