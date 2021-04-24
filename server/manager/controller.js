const express = require('express');
const router = express.Router();

const Login = require('./controllers/login');
router.get('/login', Login.get); 
router.post('/login', Login.post);
router.post('/logout', Login.logout);

const Dashboard = require('./controllers/dashboard');
router.get('/dashboard', Dashboard.get);

const Members = require('./controllers/members');
router.get('/members', Members.get);
router.post('/members/updateMemberData', Members.updateMemberData);
router.post('/members/resetMemberPassword', Members.resetMemberPassword);
router.post('/members/removeMember', Members.removeMember);

const Users = require('./controllers/users');
router.get('/users', Users.get);
router.post('/users/updateUserData', Users.updateUserData);
router.post('/users/resetUserPassword', Users.resetUserPassword);
router.post('/users/removeUser', Users.removeUser);
router.post('/users/addUser', Users.addUser);

const Menu = require('./controllers/menu');
router.get('/menu', Menu.get);
router.post('/menu/updateMenu', Menu.updateMenu);
router.post('/menu/removeMenu', Menu.removeMenu);
router.post('/menu/addMenu', Menu.addMenu);

const Orders = require('./controllers/orders');
router.get('/orders', Orders.get);
router.post('/orders/updateStatus', Orders.updateStatus);
router.post('/orders/getNotifications', Orders.getNotifications);

const History = require('./controllers/history');
router.get('/history', History.get);

module.exports = router;