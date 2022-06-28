const fileSession = require('think-session-file');
const { Console } = require('think-logger3');
const path = require('path');

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
    type: 'file',
    common: {
        cookie: {
            name: 'thinkjs'
                // keys: ['werwer', 'werwer'],
                // signed: true
        }
    },
    file: {
        handle: fileSession,
        sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
    }
};

/**
 * logger adapter config
 * @type {Object}
 */
exports.logger = {
    type: 'console',
    console: {
        handle: Console
    }
};