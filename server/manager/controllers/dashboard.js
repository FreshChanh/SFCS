const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

class Dashboard {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "Dashboard",
            sidebarComponent: local_configs.getSideMenu()
        }

        res.redirect('/manager/menu'); return;

        axios.post(`http://localhost:${configs.port}/api/users/checkAccessTokenSuperUser`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                res.render("./sites/dashboard", siteObject);
            }
            else {
                res.redirect("/manager/login");
            }
        }).catch((error) => {
            res.redirect("/manager/login");
        });
    }

    async post(req, res) {

    }
}

module.exports = new Dashboard();