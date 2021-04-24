const express = require('express');
const router = express.Router();

const sha1 = require('sha1');

const config = require('../config/config.js');

// Load database
const db = require('../config/db.js');

router.post('/add', async (req, res) => {
    /* Req: {
        access_token: "",
        ...
    }
    Res: {
        status: [0 -> OK, 1 -> Can't add]
        order_code
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "customer");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let access_token = await db.get("access_token", [["access_token = ", req.body.access_token]]);

    let menu_list = [];
    for(let i = 0; i < req.body.cartsList.length; ++i) {
        menu_list.push({"id": req.body.cartsList[i].menu_id, "count": req.body.cartsList[i].menu_count});
    }

    // Generate order code
    let numberOrdersOfUser = await db.count("orders", [["user_id = ", access_token.user_id]]);
    let order_code = `#OD-${String(access_token.user_id).padStart(6, "0")}-${String(numberOrdersOfUser).padStart(6, "0")}`;

    let insert_data = [
        ["user_id", access_token.user_id], 
        ["order_code", order_code],
        ["menu_list", JSON.stringify(menu_list)], 
        ["status", 0],
        ["created_date", config.getCurrentDate()],
        ["created_by", access_token.user_id]
    ];

    let newOrder = await db.insert("orders", insert_data);
    res.json({"status": 0, "order_code": order_code}); return;
});

router.post('/getOrdersData', async (req, res) => {
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
        ["status < ", 2]
    ]);

    let orders_list = await db.gets("orders", [
        ["status < ", 2] 
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

router.post('/getOrderData', async (req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        ordersList: []
        status: [0 -> OK, 1 -> Cant get orders data]
    } */

    let access_token = await db.get("access_token", [
        ["access_token = ", req.body.access_token]
    ]);

    if (!access_token) {
        res.json({"status": 1}); return;
    }

    let ordersList = await db.gets("orders", [
        ["user_id = ", access_token.user_id] 
    ], ` LIMIT 4`);

    for (let i = 0; i < ordersList.length; ++i) {
        let totalCost = 0;
        let menu_list = JSON.parse(ordersList[i].menu_list);
        for (let j = 0; j < menu_list.length; ++j) {
            let menu = await db.get("menu", [["id = ", menu_list[j].id]]);
            totalCost += menu.price * menu_list[j].count;
        } 
        ordersList[i].totalCost = totalCost;
    }

    res.json({"ordersList": ordersList, "status": 0}); return; 
});

router.post('/updateStatus', async (req, res) => {
    /* Req: {
        access_token
        order_id
    }
    Res: {
        member_access_token
        order_data
        status: [0 -> OK, 1 -> Cant update status data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let currentOrder = await db.get("orders", [["id = ", req.body.order_id]]);
    let status = 0;
    if (currentOrder.status == 0) {
        status = 1;
    }
    else if (currentOrder.status == 1) {
        status = 2;
    }

    let updated = await db.update("orders", [
        ["status", status]
    ], [
        ["id = ", req.body.order_id]
    ]);

    if (!updated) {
        res.json({"status": 1}); return;
    }

    let member_access_token = await db.get("access_token", [["user_id = ", currentOrder.user_id]]);

    res.json({
        "member_access_token": member_access_token.access_token, 
        "order_data": {
            "code": currentOrder.order_code,
            "status": status
        },
        "status": 0
    });
});

router.post('/getNotifications', async (req, res) => {
    /* Req: {
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant get notifications data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let notifications = await db.gets("orders", [["status = ", 0]]);
    if (!notifications) {
        res.json({"status": 1}); return;
    }

    res.json({"notifications_list": notifications, "status": 0});
});

module.exports = router;