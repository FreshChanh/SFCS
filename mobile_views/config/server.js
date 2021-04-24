exports.serverURL = "https://resolute-vault-282409.et.r.appspot.com";
// exports.serverURL = "http://192.168.1.3:8080";
exports.serverHost = exports.serverURL;
exports.socketIOHost = exports.serverURL;

exports.getPath = function(path) {
    return exports.serverHost + "/" + path;
}

import io from 'socket.io-client';
exports.socket = io(exports.socketIOHost);