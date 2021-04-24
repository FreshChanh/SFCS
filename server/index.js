const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// Load config
const config = require('./config/config.js');

// Load api
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/users', require('./api/users.js'));
app.use('/api/menu', require('./api/menu.js'));
app.use('/api/orders', require('./api/orders.js'));
app.use('/api/history', require('./api/history.js'));

// Upload file
app.use(fileUpload());

// Load manager's view
app.use(cookieParser());
app.use('/manager', require('./manager/controller.js'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/manager/views'));

// Static resource
app.use('/public', express.static(__dirname + '/public'));
app.use('/manager/public', express.static(__dirname + '/manager/views/public'));

// 404 Pages
app.get('*', function(req, res){
    res.redirect("/manager/dashboard");
});

const server = require('http').createServer(app);
const socket = require('./config/socket.io');
socket.init(server);

server.listen(config.port, () => {
    console.log(`SFCS server is running`);
});
