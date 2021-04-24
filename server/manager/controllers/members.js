const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

class Members {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "Members",
            sidebarComponent: local_configs.getSideMenu(),
            content_url: "./members.ejs",
            members_list: [],
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
                axios.post(`http://localhost:${configs.port}/api/users/getMembersData`, {
                    access_token: req.cookies.access_token,
                    page: page
                }).then((response1) => {
                    siteObject["members_list"] = response1.data.members_list;
                    siteObject["page"] = page;
                    siteObject["totalCount"] = response1.data.members_count;
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

    async updateMemberData(req, res) {
        let requestObject = {
            id: req.body.id,
            email: req.body.email,
            username: req.body.username,
            gender: req.body.gender,
            birthday: req.body.birthday,
            address: req.body.address,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/updateMemberData`, requestObject).then((response) => {
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

    async resetMemberPassword(req, res) {
        let requestObject = {
            id: req.body.id,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/resetMemberPassword`, requestObject).then((response) => {
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

    async removeMember(req, res) {
        let requestObject = {
            id: req.body.id,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/users/removeMember`, requestObject).then((response) => {
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
}

module.exports = new Members();