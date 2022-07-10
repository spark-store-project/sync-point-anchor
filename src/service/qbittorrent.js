let clientConn = {};
const noderequest = require('request');
const getInface = Symbol('getInface');
const fs = require('fs');
let currentCookie = null;
const path = require('path');
const FormData = require('form-data');
let allCookie = {};
let currentAddress = null;
const axios = require('axios');
module.exports = class extends think.Service {
    async getConn(index) {
        let that = this;
        let client = await that[getInface](index);
        return client;
    }
    async [getInface](index) {
        let that = this;
        let clientAddress = think.config('qbittorrent_host_pool')[index];
        currentAddress = clientAddress;
        await that.getCookie();
    }
    async getAllTask() {
        let that = this;
        if (think.isEmpty(currentCookie)) {
            let errorMsg = { msg: '连接不存在' };
            throw errorMsg;
        }
        let existResult = await that.request('/torrents/info', { filter: 'downloading' });
        for (let item of existResult) {
            item.infoHash = item.hash;
        }
        return existResult;
    }
    async addTorrent(torrentFile, downloadPath) {
        let that = this;
        if (think.isEmpty(currentCookie)) {
            let errorMsg = { msg: '连接不存在' };
            throw errorMsg;
        }
        var options = {
            'method': 'POST',
            'url': `http://${currentAddress.host}:${currentAddress.port}/api/v2/torrents/add`,
            'headers': {
                'Cookie': currentCookie
            },
            formData: {
                'torrents': {
                    'value': fs.createReadStream(torrentFile),
                    'options': {
                        'filename': path.basename(torrentFile),
                        'contentType': null
                    }
                },
                'savepath': downloadPath
            }
        };
        noderequest(options);
    }
    async request(url, data, headers = {}, method = 'get') {
        let that = this;
        let host = `http://${currentAddress.host}:${currentAddress.port}/api/v2`;
        const md5 = think.md5(JSON.stringify(think.omit(currentAddress, 'weight')));
        url = `${host}${url}`;
        if (think.isEmpty(allCookie[md5])) {
            await that.getCookie();
        }

        let axiosdata = await axios({ url: url, method: method, headers: Object.assign({ 'Cookie': currentCookie }, headers), data: data });
        think.logger.info(axiosdata);
        return axiosdata.data;
    }
    async getCookie() {
        let host = `http://${currentAddress.host}:${currentAddress.port}/api/v2`;
        const md5 = think.md5(JSON.stringify(think.omit(currentAddress, 'weight')));
        let data = await axios({ url: `${host}/auth/login`, method: 'get', params: { username: currentAddress.username, password: currentAddress.password } });
        allCookie[md5] = data['headers']['set-cookie'][0];
        currentCookie = data['headers']['set-cookie'][0];
    }
};
// http://192.168.31.9:8080/api/v2/torrents/add
// fileselect[] filename
// savepath
// Cookie: SID = your_sid
// [
//     {
//       added_on: 1657463665,
//       amount_left: 3508205568,
//       auto_tmm: false,
//       availability: 83.03700256347656,
//       category: '',
//       completed: 146751488,
//       completion_on: 0,
//       content_path: '/media/root/537cea70-b652-4c80-b9d0-d2004c5f7b66/ubuntu-22.04-desktop-amd64.iso',
//       dl_limit: -1,
//       dlspeed: 7098789,
//       download_path: '',
//       downloaded: 144750192,
//       downloaded_session: 147937590,
//       eta: 1145,
//       f_l_piece_prio: false,
//       force_start: false,
//       hash: '2c6b6858d61da9543d4231a71db4b1c9264b0685',
//       infohash_v1: '2c6b6858d61da9543d4231a71db4b1c9264b0685',
//       infohash_v2: '',
//       last_activity: 1657463703,
//       magnet_uri: 'magnet:?xt=urn:btih:2c6b6858d61da9543d4231a71db4b1c9264b0685&dn=ubuntu-22.04-desktop-amd64.iso&tr=https%3a%2f%2ftorrent.ubuntu.com%2fannounce&tr=https%3a%2f%2fipv6.torrent.ubuntu.com%2fannounce',
//       max_ratio: -1,
//       max_seeding_time: -1,
//       name: 'ubuntu-22.04-desktop-amd64.iso',
//       num_complete: 1102,
//       num_incomplete: 28,
//       num_leechs: 7,
//       num_seeds: 83,
//       priority: 1,
//       progress: 0.04015135766344829,
//       ratio: 0,
//       ratio_limit: -2,
//       save_path: '/media/root/537cea70-b652-4c80-b9d0-d2004c5f7b66',
//       seeding_time: 0,
//       seeding_time_limit: -2,
//       seen_complete: 1657463702,
//       seq_dl: false,
//       size: 3654957056,
//       state: 'downloading',
//       super_seeding: false,
//       tags: '',
//       time_active: 37,
//       total_size: 3654957056,
//       tracker: 'https://ipv6.torrent.ubuntu.com/announce',
//       trackers_count: 2,
//       up_limit: -1,
//       uploaded: 0,
//       uploaded_session: 0,
//       upspeed: 0
//     }
//   ]