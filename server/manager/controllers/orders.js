const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

class Orders {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "Orders",
            sidebarComponent: local_configs.getSideMenu(),
            content_url: "./orders.ejs",
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
            selected: -1,
            totalCount: 0
        }

        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        let selected = -1;
        if (req.query.selected) {
            selected = req.query.selected;
        }
        siteObject["selected"] = selected;

        axios.post(`http://localhost:${configs.port}/api/users/checkAccessTokenSuperUser`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                axios.post(`http://localhost:${configs.port}/api/orders/getOrdersData`, {
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

    async updateStatus(req, res) {
        let apiRequestObject = {
            "access_token": req.cookies.access_token,
            "order_id": req.body.order_id
        }
        
        axios.post(`http://localhost:${configs.port}/api/orders/updateStatus`, apiRequestObject).then((response) => {
            if (response.data.status == 0) {
                res.json(response.data);
            }
            else {
                res.json({status: 1});
            }
        }); 
    }

    async getNotifications(req, res) {
        let apiRequestObject = {
            "access_token": req.cookies.access_token        
        }
        axios.post(`http://localhost:${configs.port}/api/orders/getNotifications`, apiRequestObject).then((response) => {
            if (response.data.status == 0) {
                res.json({notifications_list: response.data.notifications_list, status: 0});
            }
            else {
                res.json({status: 1});
            }
        }); 
    }
}

module.exports = new Orders();