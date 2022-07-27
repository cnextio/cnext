const { JsonRpcStreamReader, JsonRpcStreamWriter } = require('./streams');
const { spawn, exec } = require('child_process');
// action channel
const LanguageServer = 'LanguageServer';
const LanguageServerNotifier = 'LanguageServerNotifier';
const LanguageServerHover = 'LanguageServerHover';
const LanguageServerCompletion = 'LanguageServerCompletion';
const LanguageServerSignature = 'LanguageServerSignature';

const NotifyCase = ['textDocument/publishDiagnostics'];
class LSPProcess {
    constructor(io) {
        this.ls = spawn('pyls', ['-v'], { shell: true });
        const reader = new JsonRpcStreamReader(this.ls.stdout);

        this.ls.stdout.on('data', (chunk) => {
            const payload = reader.getData(chunk);
            if (payload && payload.result) {
                const channel = this.getChannel(payload.result);
                io.emit(channel, JSON.stringify(payload.result));
                reader.clearCache();
            } else if (this.isNeedNotify(payload)) {
                io.emit(LanguageServerNotifier, JSON.stringify(payload));
                reader.clearCache();
            }
        });

        this.ls.stderr.on('data', (stderr) => {
            // console.log('stderr', stderr.toString());
        });
    }

    isNeedNotify(payload) {
        return payload && payload.method && NotifyCase.includes(payload.method);
    }

    getChannel(result) {
        if ('signatures' in result) {
            return LanguageServerSignature;
        } else if ('contents' in result) {
            return LanguageServerHover;
        } else if ('isIncomplete' in result) {
            return LanguageServerCompletion;
        } else {
            return LanguageServer;
        }
    }

    sendMessageToLsp(message) {
        const writer = new JsonRpcStreamWriter();
        const lspPayload = writer.getPayload(message);
        this.ls.stdin.write(Buffer.from(lspPayload, 'utf-8'));
    }
}
module.exports = {
    LSPProcess,
    LanguageServer,
    LanguageServerHover,
    LanguageServerSignature,
    LanguageServerCompletion,
};
