var axios = require('axios');
var FormData = require('form-data');
var fs = require('fs');
var data = new FormData();
data.append('torrents', fs.createReadStream('/root/桌面/p2p_test/aria2/8568c6ac1d15b0731d59cb835a5ed10b670c36ea.torrent'), { contentType: null, filename: '8568c6ac1d15b0731d59cb835a5ed10b670c36ea.torrent' });
data.append('savepath', '/media/root/537cea70-b652-4c80-b9d0-d2004c5f7b66');

var config = {
    method: 'post',
    url: 'http://192.168.31.9:8080/api/v2/torrents/add',
    headers: {
        'Connection': 'keep-alive',
        'Cookie': 'SID=kiVBz4OY4L7zQ838NADOGgoqTqAUxKTx',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Upgrade-Insecure-Requests': 1,
        'Host': '192.168.31.9:8080',
        'Origin': 'http://192.168.31.9:8080',
        ...data.getHeaders()
    },
    data: data
};

axios(config)
    .then(function(response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function(error) {
        console.log(error);
    });