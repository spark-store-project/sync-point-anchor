const Base = require('./base.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const parseTorrent = require('parse-torrent');
let existResultCache = {};
module.exports = class extends Base {
    base64Encode(file) {
        // read binary data
        let bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }
    async indexAction() {
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
        let torrentDownloadService = think.service('aria2');
        for (const result of walker) {
            if (!result.includes('.deb.torrent')) continue;
            let localTorrent = result;
            if (result.indexOf('http') != -1) {
                let { data: remoteTorrentData } = await axios({ url: result, responseType: 'arraybuffer' }).catch(e => { return false; });
                if (think.isEmpty(remoteTorrentData)) continue;
                let fileName = `${think.uuid().replace(/-/g, '')}.torrent`; // 重新生成一个本地随机的名字
                localTorrent = path.join('/tmp', fileName);
                fs.writeFileSync(localTorrent, remoteTorrentData);
            }
            if (!think.isExist(localTorrent)) {
                continue;
            }
            let torrentData = fs.readFileSync(localTorrent);
            let torrentInfo = parseTorrent(torrentData);
            think.logger.info('连接aria2');
            think.logger.info(think.config('aria2c_host_pool'));
            let mod = parseInt(torrentInfo.infoHash, 16) % think.config('aria2c_host_pool').length;
            think.logger.info('取模：', mod);
            await torrentDownloadService.getConn(mod);
            if (think.isEmpty(existResultCache[mod])) {
                existResultCache[mod] = [];
                think.logger.info('开始增加缓存：', mod);
                let existResult = await torrentDownloadService.getAllTask();
                for (let item of existResult) {
                    if (think.isEmpty(item.bittorrent)) continue;
                    existResultCache[mod].push(item.infoHash);
                }
            }
            if (existResultCache[mod].includes(torrentInfo.infoHash)) continue;
            let fileDirName = path.basename(torrentInfo.name, path.extname(torrentInfo.name));
            let downloadPath = path.join(think.config('target_path'), fileDirName);
            think.logger.info('调用aria2下载', result);
            await torrentDownloadService.addTorrent(localTorrent, downloadPath);
            think.logger.info('调用aria2完成，目标路径：', downloadPath);
        }
    }
};