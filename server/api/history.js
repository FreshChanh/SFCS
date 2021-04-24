const express = require('express');
const router = express.Router();

const sha1 = require('sha1');

const config = require('../config/config.js');

// Load database
const db = require('../config/db.js');

router.post('/getHistoryData', async (req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        orders_list: []
        orders_count: 0
        status: [0 -> OK, 1 -> Cant get members data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let orders_count = await db.count("orders", [
        ["status = ", 2]
    ]);

    let orders_list = await db.gets("orders", [
        ["status = ", 2] 
    ], ` LIMIT 7 OFFSET ${7 * (req.body.page - 1)}`);

    for (let i = 0; i < orders_list.length; ++i) {
        let member = await db.get("users", [["id = ", orders_list[i].user_id]]);
        orders_list[i].user_id = member.username;

        let menu_list = JSON.parse(orders_list[i].menu_list);
        let menu_array = [];
        for (let j = 0; j < menu_list.length; ++j) {
            let menu = await db.get("menu", [["id = ", menu_list[j].id]]);
            menu_array.push({"title": menu.name, "price": menu.price, "count": menu_list[j].count});
        } 
        orders_list[i].menu_list = menu_array;
    }

    res.json({"orders_list": orders_list, "orders_count": orders_count, "status": 0}); return; 
});

module.exports = router;