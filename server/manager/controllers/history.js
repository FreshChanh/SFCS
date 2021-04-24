const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

class History {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "History",
            sidebarComponent: local_configs.getSideMenu(),
            content_url: "./history.ejs",
            orders_list: [],
            getYYYYMMDD: (rawDatetime) => {
                let date = new Date(rawDatetime);
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0]
            },
            numberWithCommas: function(x) {
                if (x)
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return "";
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
                axios.post(`http://localhost:${configs.port}/api/history/getHistoryData`, {
                    access_token: req.cookies.access_token,
                    page: page
                }).then((response1) => {
                    siteObject["orders_list"] = response1.data.orders_list;
                    siteObject["page"] = page;
                    siteObject["totalCount"] = response1.data.orders_count;
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
}

module.exports = new History();