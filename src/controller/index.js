const Base = require('./base.js');
const Aria2 = require('aria2c');
import LBA from 'load-balancer-algorithm';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const parseTorrent = require('parse-torrent');
let aria2cClientConn = {};
const _checkAria2c = Symbol('_checkAria2c');
module.exports = class extends Base {
    base64Encode(file) {
        // read binary data
        let bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }
    async indexAction() {
        let that = this;
        think.logger.info('连接aria2');
        let aria2cClient = await that[_checkAria2c]();
        let existResult = await aria2cClient.tellActive();
        let infoHashList = [];
        for (let item of existResult) {
            if (think.isEmpty(item.bittorrent)) continue;
            infoHashList.push(item.infoHash);
        }
        think.logger.info('开始遍历');
        let data = null;
        if (think.config('torrent_name').indexOf('http') != -1) {
            // 用axios从网络下载
            let { data: remoteData } = await axios({ url: think.config('torrent_name'), responseType: 'arraybuffer' });

            data = JSON.parse(remoteData);
        } else {
            // 读取项目目录的文件
            data = JSON.parse(fs.readFileSync(path.join(think.ROOT_PATH, think.config('torrent_name')), { encoding: 'utf-8' }));
        }
        let walker = data;
        think.logger.info('结束遍历');
        for (const result of walker) {
            if (!result.includes('.deb.torrent')) continue;
            let torrentData = null;
            if (result.indexOf('http') != -1) {
                let { data: remoteTorrentData } = await axios({ url: result, responseType: 'arraybuffer' }).catch(e => { return false; });
                if (think.isEmpty(remoteTorrentData)) continue;
                torrentData = remoteTorrentData;
            } else {
                if (!think.isExist(result)) {
                    continue;
                }
                torrentData = fs.readFileSync(result);
            }
            let torrentInfo = parseTorrent(torrentData);
            if (infoHashList.includes(torrentInfo.infoHash)) continue;
            let fileDirName = path.basename(torrentInfo.name, path.extname(torrentInfo.name));
            let downloadPath = path.join(think.config('target_path'), fileDirName);
            think.logger.info('调用aria2下载', result);
            await aria2cClient.call('aria2.addTorrent', Buffer.from(torrentData).toString('base64'), [], { dir: downloadPath });
            think.logger.info('调用aria2完成，目标路径：', downloadPath);
        }
    }
    async [_checkAria2c]() {
        let aria2AddressPool = think.config('aria2c_host_pool');
        const wrr = new LBA.WeightedRoundRobin(aria2AddressPool);
        let aria2Address = wrr.pick();
        think.logger.info(aria2Address);
        const md5 = think.md5(JSON.stringify(think.omit(aria2Address, 'weight')));
        if (!aria2cClientConn[md5]) {
            aria2cClientConn[md5] = new Aria2({
                url: `http://${aria2Address.host}/jsonrpc`
            });
        }
        return aria2cClientConn[md5];
    }
};