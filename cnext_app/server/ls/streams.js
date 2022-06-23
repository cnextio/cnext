class JsonRpcStreamReader {
    constructor(stdout) {
        this.stdout = stdout;
        this.cache = [];
        this.lastContentLength = 0;
    }

    getData(chunk) {
        const messages = chunk.toString('utf-8').split('\n');
        // console.log(`get chunk at ${new Date().toLocaleString()} `, messages);

        if (messages.length > 3) {
            // have full chunk with content-type
            const content_length = this.getContentLength(messages[0]);
            this.lastContentLength = content_length;

            if (content_length === messages[3].length) {
                // have full response with multi lines
                try {
                    return JSON.parse(messages[messages.length - 1]);
                } catch (error) {
                    return null;
                }
            }
            // add to cache
            this.cache.push(...messages);
            return null;
        } else {
            // try get additional response
            // when have one line additional info
            if (!this.cache.includes(messages[0])) {
                this.cache.push(messages[0]);
            }
            // get object response from cache
            //console.log("this.cache", this.cache);
            let resultObj = '';
            for (let i = 3; i < this.cache.length; i++) {
                resultObj += this.cache[i];
            }

            if (this.lastContentLength === resultObj.length) {
                // have full response with multi lines
                try {
                    return JSON.parse(resultObj);
                } catch (error) {
                    return null;
                }
            }
            return null;
        }
    }

    getContentLength(mes) {
        if (mes.toString().includes('Content-Length')) {
            return parseInt(mes.split(' ')[1]);
        }
        return 0;
    }

    clearCache() {
        this.cache = [];
    }
}

class JsonRpcStreamWriter {
    getPayload(message) {
        // console.log(
        //     `getPayload and send to LSP ${new Date().toLocaleString()} `,
        //     JSON.parse(message)
        // );
        const encodedMessage = Buffer.from(message, 'utf-8');
        const length = encodedMessage.length;
        return `Content-Length: ${length}\r\n Content-Type: application/vscode-jsonrpc; charset=utf8\r\n\r\n${encodedMessage}`;
    }
}

module.exports = {
    JsonRpcStreamReader,
    JsonRpcStreamWriter,
};
