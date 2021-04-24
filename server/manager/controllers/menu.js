const axios = require('axios');
const configs = require('../../config/config');
const local_configs = require('../config');

const sha1 = require('sha1');

class Menu {
    constructor() {

    }

    async get(req, res) {

        let siteObject = {
            title: "Menu",
            sidebarComponent: local_configs.getSideMenu(),
            content_url: "./menu.ejs",
            menu_list: [],
            numberWithCommas: function(x) {
                if (x)
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return "";
            },
            getYYYYMMDD: (rawDatetime) => {
                let date = new Date(rawDatetime);
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0]
            }
        }

        axios.post(`http://localhost:${configs.port}/api/users/checkAccessTokenSuperUser`, {
            access_token: req.cookies.access_token
        }).then((response) => {
            if (response.data.status == 0) {
                axios.post(`http://localhost:${configs.port}/api/menu/getMenuList`, {
                    access_token: req.cookies.access_token
                }).then((response1) => {
                    siteObject["menu_list"] = response1.data.menu_list;
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

    async updateMenu(req, res) {
        let apiRequestObject = {
            "access_token": req.cookies.access_token,
            "id": req.body.edit_id,
            "title": req.body.edit_title,
            "price": req.body.edit_price,
            "type": req.body.edit_type,
            "description": req.body.edit_description
        }
        if (req.body.edit_bestseller && req.body.edit_bestseller == "on") {
            apiRequestObject["bestseller"] = req.body.edit_bestseller;
        }

        if (req.body.edit_saleoff && req.body.edit_saleoff == "on") {
            apiRequestObject["saleoff"] = req.body.edit_saleoff;
        }
        
        if (req.files && Object.keys(req.files).length !== 0) {
            // File upload
            let thumbnail = req.files.edit_thumbnail;
            let filepath = sha1(thumbnail.name + Math.random().toString()) + "." + thumbnail.name.split('.').pop();
            thumbnail.mv(`./public/${filepath}`, function (err) {
                if (err) return res.status(500).send(err);
                apiRequestObject["file_path"] = `/${filepath}`;
                axios.post(`http://localhost:${configs.port}/api/menu/updateMenu`, apiRequestObject).then((response) => {
                    res.redirect('/manager/menu');
                });
            });
        } else {
            axios.post(`http://localhost:${configs.port}/api/menu/updateMenu`, apiRequestObject).then((response) => {
                res.redirect('/manager/menu');
            });
        }
    }

    async removeMenu(req, res) {
        let requestObject = {
            id: req.body.id,
            access_token: req.cookies.access_token
        };
        axios.post(`http://localhost:${configs.port}/api/menu/removeMenu`, requestObject).then((response) => {
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

    async addMenu(req, res) {
        
        let apiRequestObject = {
            "access_token": req.cookies.access_token,
            "title": req.body.add_title,
            "price": req.body.add_price,
            "type": req.body.add_type,
            "description": req.body.add_description
        }
        if (req.body.add_bestseller && req.body.add_bestseller == "on") {
            apiRequestObject["bestseller"] = req.body.add_bestseller;
        }

        if (req.body.add_saleoff && req.body.add_saleoff == "on") {
            apiRequestObject["saleoff"] = req.body.add_saleoff;
        }
        
        let thumbnail = req.files.add_thumbnail;
        let filepath = sha1(thumbnail.name + Math.random().toString()) + "." + thumbnail.name.split('.').pop();
        apiRequestObject["file_path"] = `/${filepath}`;

        thumbnail.mv(`./public/${filepath}`, function (err) {
            if (err) return res.status(500).send(err);
            axios.post(`http://localhost:${configs.port}/api/menu/addMenu`, apiRequestObject).then((response) => {
                res.redirect('/manager/menu');
            });
        });
    }
}

module.exports = new Menu();