const db = require('./db');

let clientsList = {};

function saveClient(access_token, socket) {
    clientsList[access_token] = socket;
}

function getClient(access_token) {
    if (clientsList.hasOwnProperty(access_token)) {
        return clientsList[access_token];
    }
    return "none";
}

exports.init = function (server) {

    let io = require('socket.io')(server, {
        path: '/socket.io',
        serveClient: false,
        pingInterval: 500
    });

    io.on('connection', function(socket) {

        let private_access_token = "";

        console.log("Connected to socket.io from " + socket.client.id);

        socket.on('register admin', function(data) {
            console.log("REGISTERED ADMIN");
            socket.join('admin room');
        });

        socket.on('register customer', function(data) {
            console.log("REGISTERED CUSTOMER");
            saveClient(data.access_token, socket);
            private_access_token = data.access_token;
        });

        socket.on('orders to cook', async function (data) {

            let token_row = await db.get('access_token', [
                ["access_token = ", data.access_token]
            ]);
            let member = await db.get('users', [
                ["id = ", token_row.user_id]
            ]);

            let message = `Member ${member.username} created order ${data.order_code} !`;

            io.to('admin room').emit('notify cook', message);
        });

        socket.on('notify user', async function(data) {
            let clientSocket = getClient(data.member_access_token);
            if (clientSocket != "none") {
                console.log("NOTIFIED USER");
                let order_status = "finished";
                if (data.order_data.status == 1)
                    order_status = "is in processing";
                clientSocket.emit("notify user", `Your order ${data.order_data.code} ${order_status}`);
            }
        });

        socket.on('disconnect', function() {
            socket.removeAllListeners();
            console.log(`A CLIENT DISCONNECTED`);
        });
    });
}

exports.close = function(io) {
    return 0;
}