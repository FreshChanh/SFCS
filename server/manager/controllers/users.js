const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

class Users {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "Users",
            sidebarComponent: local_configs.getSideMenu(),
            content_url: "./users.ejs",
            users_list: [],
            getYYYYMMDD: (rawDatetime) => {
                let date = new Date(rawDatetime);
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0]
            },
            page: 1,
            totalCount: 0
        }

        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        axios.post(`http://localhost:${configs.port}/api/users/checkAccessTokenSuperUser`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                axios.post(`http://localhost:${configs.port}/api/users/getUsersData`, {
                    access_token: req.cookies.access_token,
                    page: page
                }).then((response1) => {
                    siteObject["users_list"] = response1.data.users_list;
                    siteObject["page"] = page;
                    siteObject["totalCount"] = response1.data.users_count;
                    res.render("./sites/dashboard", siteObject);
                });
            }
            else {
                res.redirect("/manager/login");
            }
        }).catch((error) => {
            res.redirect("/manager/login");
        });
    }

    async updateUserData(req, res) {
        let requestObject = {
            id: req.body.id,
            email: req.body.email,
            username: req.body.username,
            gender: req.body.gender,
            birthday: req.body.birthday,
            address: req.body.address,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/updateUserData`, requestObject).then((response) => {
            if (response.data.status == 0) {
                res.json({"status": "success"});
            }
            else {
                res.json({"status": "cant_update"});
            }
        }).catch((error) => {
            res.json({"status": "error"});
        });
    }

    async resetUserPassword(req, res) {
        let requestObject = {
            id: req.body.id,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/resetUserPassword`, requestObject).then((response) => {
            if (response.data.status == 0) {
                res.json({"status": "success"});
            }
            else {
                res.json({"status": "cant_reset"});
            }
        }).catch((error) => {
            res.json({"status": "cant_reset"});
        });
    }

    async removeUser(req, res) {
        let requestObject = {
            id: req.body.id,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/removeUser`, requestObject).then((response) => {
            if (response.data.status == 0) {
                res.json({"status": "success"});
            }
            else {
                res.json({"status": "cant_remove"});
            }
        }).catch((error) => {
            res.json({"status": "cant_remove"});
        });
    }

    async addUser(req, res) {
        let requestObject = {
            email: req.body.email,
            username: req.body.username,
            gender: req.body.gender,
            birthday: req.body.birthday,
            address: req.body.address,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/addUser`, requestObject).then((response) => {
            if (response.data.status == 0) {
                res.json({"status": "success"});
            }
            else if (response.data.status == 1){
                res.json({"status": "cant_add"});
            }
            else if (response.data.status == 2){
                res.json({"status": "email_existed"});
            }
            else if (response.data.status == 3){
                res.json({"status": "username_existed"});
            }
        }).catch((error) => {
            res.json({"status": "error"});
        });
    }
}

module.exports = new Users();