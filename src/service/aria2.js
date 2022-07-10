let aria2cClientConn = {};
const Aria2 = require('aria2c');
const getInface = Symbol('getInface');
let currentConn = null;
const fs = require('fs');
module.exports = class extends think.Service {
    getConn(index) {
        let that = this;
        return that[getInface](index);
    }
    async [getInface](index) {
        let aria2Address = think.config('aria2c_host_pool')[index];
        const md5 = think.md5(JSON.stringify(think.omit(aria2Address, 'weight')));
        if (!aria2cClientConn[md5]) {
            aria2cClientConn[md5] = new Aria2({
                url: `http://${aria2Address.host}:${aria2Address.port}/jsonrpc`
            });
        }
        currentConn = aria2cClientConn[md5];
        return currentConn;
    }
    async getAllTask() {
        if (think.isEmpty(currentConn)) {
            let errorMsg = { msg: '连接不存在' };
            throw errorMsg;
        }
        let existResult = await currentConn.tellActive();
        return existResult;
    }
    async addTorrent(torrentFile, downloadPath) {
        if (think.isEmpty(currentConn)) {
            let errorMsg = { msg: '连接不存在' };
            throw errorMsg;
        }
        let torrentData = fs.readFileSync(torrentFile);
        await currentConn.call('aria2.addTorrent', Buffer.from(torrentData).toString('base64'), [], { dir: downloadPath });
    }
};