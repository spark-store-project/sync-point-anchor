// invoked in worker
const path = require('path');
const fs = require('fs');

function getConfig() {
    // let that = this;
    let configFilePath = path.join(think.ROOT_PATH, 'config.json');
    let configData = JSON.parse(fs.readFileSync(configFilePath));
    think.config('aria2c_rpc', configData.aria2c_rpc);
    think.config('aria2c_host', configData.aria2c_host);
    think.config('torrent_name', configData.torrent_name);
    think.config('target_path', configData.target_path);
}
think.beforeStartServer(() => {
    getConfig();
});