const axios = require('axios');
const configs = require('../../config/config');

class Login {
    constructor() {

    }

    async get(req, res) {
        axios.post(`http://localhost:${configs.port}/api/users/checkAccessTokenSuperUser`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                res.redirect('/manager/dashboard');
            }
            else {
                res.render("./sites/login", {title: "Login"});
            }
        }).catch((error) => {
            res.render("./sites/login", {title: "Login"});
        });
    }

    async post(req, res) {
        axios.post(`http://localhost:${configs.port}/api/users/loginSuperuser`, {
            username: req.body.username,
            password: req.body.password
        }).then((response) => {
            if (response.data.status == 0) {
                res.cookie("access_token", response.data.access_token);
                res.redirect('/manager/dashboard');
            }
            else {
                res.render("./sites/login", {title: "Login", message: "Your login information is not correct !"});
            }
        }).catch((error) => {
            res.render("./sites/login", {title: "Login", message: "Some errors have occurred !"});
        });
    }

    async logout(req, res) {
        axios.post(`http://localhost:${configs.port}/api/users/logout`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                res.redirect('/manager/login');
            }
            else {
                res.send("Can't logout");
            }
        }).catch((error) => {
            res.send("Can't logout");
        });
    }
}

module.exports = new Login();