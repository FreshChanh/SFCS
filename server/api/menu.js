const express = require('express');
const router = express.Router();

const config = require('../config/config.js');

// Load database
const db = require('../config/db.js');

router.get('/bestsellers', async (req, res) => {
    /* Req: {

    }
    Res: {
        object: [{
            name: "",
            price: "",
            image_url: ""
        }]
        status: 0 -> OK, 1 -> Failed
    } */

    let bestsellers = await db.gets("menu", [["best_seller = ", 1], ["trash = ", 0]]);
    if (!bestsellers) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    bestsellers.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;

});

router.get('/salesoff', async (req, res) => {
    /* Req: {

    }
    Res: {
        object: [{
            name: "",
            price: "",
            image_url: ""
        }]
        status: 0 -> OK, 1 -> Failed
    } */

    let salesoff = await db.gets("menu", [["sale_off = ", 1], ["trash = ", 0]]);
    if (!salesoff) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    salesoff.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;
});

router.get('/food', async (req, res) => {
    /* Req: {

    }
    Res: {
        object: [{
            name: "",
            price: "",
            image_url: ""
        }]
        status: 0 -> OK, 1 -> Failed
    } */

    let foodsList = await db.gets("menu", [["type = ", 1], ["trash = ", 0]]);
    if (!foodsList) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    foodsList.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;
});

router.get('/drink', async (req, res) => {
    /* Req: {

    }
    Res: {
        object: [{
            name: "",
            price: "",
            image_url: ""
        }]
        status: 0 -> OK, 1 -> Failed
    } */

    let drinksList = await db.gets("menu", [["type = ", 2], ["trash = ", 0]]);
    if (!drinksList) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    drinksList.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;
});

router.get('/fruit', async (req, res) => {
    /* Req: {

    }
    Res: {
        object: [{
            name: "",
            price: "",
            image_url: ""
        }]
        status: 0 -> OK, 1 -> Failed
    } */

    let fruitsList = await db.gets("menu", [["type = ", 3], ["trash = ", 0]]);
    if (!fruitsList) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    fruitsList.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;
});

router.get('/details/:menuId', async (req, res) => {

    /* Req: {

    }
    Res: {
        id: int,
        name: "",
        price: int,
        description: "",
        image_path: "",
        status: 0 -> OK, 1 -> Failed
    } */

    let menuId = req.params.menuId;

    let details = await db.get("menu", [["id = ", menuId]]);

    if (!details) {
        res.json({"status": 1}); return;
    }
    
    res.json({
        "id": menuId,
        "name": details.name,
        "price": details.price,
        "description": details.description,
        "image_path": details.image_path,
        "type": details.type,
        "status": 0
    });

    
});

router.post("/getMenuList", async (req, res) => {
    /* Req: {
        access_token
    }
    Res: {
        menu_list: []
        status: 0 -> OK, 1 -> Failed
    } */
    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let menu_list = await db.gets("menu", [
        ["trash = ", 0]
    ]);

    res.json({"menu_list": menu_list, "status": 0}); return;
});

router.post("/updateMenu", async (req, res) => {
    /* Req: {
        access_token
        id
        title
        price
        type
        description
        bestseller
        saleoff
        file_path
    }
    Res: {
        status: 0 -> OK, 1 -> Failed
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let updateData = [
        ["name", req.body.title],
        ["price", req.body.price],
        ["type", req.body.type],
        ["description", req.body.description],
        ["best_seller", (req.body.bestseller) ? 1 : 0],
        ["sale_off", (req.body.saleoff) ? 1 : 0],
        ["updated_date", config.getCurrentDate()]
    ];

    if (req.body.file_path) {
        updateData.push(["image_path", req.body.file_path]);
    }

    let updated = await db.update("menu", updateData, [
        ["id = ", req.body.id]
    ]);

    if (!updated) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
    
});

router.post("/addMenu", async (req, res) => {
    /* Req: {
        access_token
        title
        price
        type
        description
        bestseller
        saleoff
        file_path
    }
    Res: {
        status: 0 -> OK, 1 -> Failed
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let insertData = [
        ["name", req.body.title],
        ["image_path", req.body.file_path],
        ["price", req.body.price],
        ["type", req.body.type],
        ["best_seller", (req.body.bestseller) ? 1 : 0],
        ["sale_off", (req.body.saleoff) ? 1 : 0],
        ["description", req.body.description],
        ["user_created", 1],
        ["trash", 0],
        ["created_date", config.getCurrentDate()],
        ["updated_date", config.getCurrentDate()]
        
    ];

    let newMenu = await db.insert("menu", insertData);

    if (!newMenu) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
    
});

router.post('/removeMenu', async (req, res) => {
    /* Req: {
        id,
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant remove this menu]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let reset = await db.update("menu", [
        ["trash", 1],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id]    
    ]);

    if (!reset) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/search', async (req, res) => {
    /* Req: {
        params
    }
    Res: {
        menu_list: []
        status: [0 -> OK, 1 -> Cant search menu]
    } */
    let menuList = [];
    if (req.body.category != "all") {
        menuList = await db.search("menu", [
            ["name", `%${req.body.params}%`],
            ["description", `%${req.body.params}%`]
        ], ` AND type = ${req.body.category == "food" ? "1" : req.body.category == "drink" ? "2" : "3"}`);
    }
    else {
        menuList = await db.search("menu", [
            ["name", `%${req.body.params}%`],
            ["description", `%${req.body.params}%`]
        ]);
    }

    

    if (!menuList) {
        res.json({"status": 1}); return;
    }

    let responseObject = [];
    menuList.forEach((menu) => {
        responseObject.push({
            "id": menu.id,
            "name": menu.name,
            "price": menu.price,
            "image_path": menu.image_path
        });
    });
    
    res.json({
        "object": responseObject,
        "status": 0
    }); return;
});

module.exports = router;