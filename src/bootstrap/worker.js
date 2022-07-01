// invoked in worker
const path = require('path');
const fs = require('fs');

function getConfig() {
    // let that = this;
    let configFilePath = path.join(think.ROOT_PATH, 'config.json');
    let configData = JSON.parse(fs.readFileSync(configFilePath));
    for (let item in configData) {
        think.config(item, configData[item]);
    }
}
think.beforeStartServer(() => {
    getConfig();
});