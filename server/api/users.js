const express = require('express');
const router = express.Router();

const sha1 = require('sha1');

const config = require('../config/config.js');

// Load database
const db = require('../config/db.js');

router.post('/signup', async (req, res) => {
    /* Req: {
        email: "", 
        username: "",
        raw_password: ""
    }
    Res: {
        status: [0 -> OK, 1 -> Email existed, 2 -> Username existed]
    } */
    // Check email
    let is_existed_email = await db.get("users", [
        ["email = ", req.body.email],
        ["usertype = ", "customer"]
    ]);
    let is_existed_username = await db.get("users", [
        ["username = ", req.body.username],
        ["usertype = ", "customer"]
    ]);
    if (is_existed_email) {
        res.json({"status": 1}); return;
    }
    if (is_existed_username) {
        res.json({"status": 2}); return;
    }

    let insert_data = [
        ["email", req.body.email], 
        ["username", req.body.username], 
        ["password", sha1(req.body.raw_password)],
        ["usertype", "customer"],
        ["gender", -1],
        ["birthday", "0001-01-01"],
        ["address", ""],
        ["trash", 0],
        ["created_date", config.getCurrentDate()],
        ["updated_date", config.getCurrentDate()]
    ];

    let newUserId = await db.insert("users", insert_data);
    res.json({"status": 0}); return;
});

router.post('/login', async (req, res) => {
    /* Req: {
        username: "",
        password: ""
    }
    Res: {
        status: [0 -> OK, 1 -> Not valid]
    } */
    let user = await db.get("users", [
        ["username = ", req.body.username], 
        ["password = ", sha1(req.body.password)],
        ["usertype = ", "customer"]
    ]);
    if (!user) {
        res.json({"status": 1}); return;
    }

    // Generate access token
    let access_token = sha1(req.body.username + config.getCurrentDate() + Math.random().toString());
    let newAccessTokenId = await db.insert("access_token", [
        ["user_id", user.id],
        ["access_token", access_token],
        ["created_date", config.getCurrentDate()]
    ]);

    res.json({"status": 0, "access_token": access_token}); return;
});

router.post('/logout', async (req, res) => {
    /* Req: {
        access_token: ""
    }
    Res: {
        status: [0 -> OK, 1 -> Cant logout]
    } */
    await db.removes("access_token", [
        ["access_token = ", req.body.access_token]
    ]);

    res.json({"status": 0}); return;
});

router.post('/loginSuperuser', async (req, res) => {
    /* Req: {
        username: "",
        password: ""
    }
    Res: {
        status: [0 -> OK, 1 -> Not valid]
    } */
    let user = await db.get("users", [
        ["username = ", req.body.username], 
        ["password = ", sha1(req.body.password)],
        ["usertype = ", "superuser"]
    ]);
    if (!user) {
        res.json({"status": 1}); return;
    }

    // Generate access token
    let access_token = sha1(req.body.username + config.getCurrentDate() + Math.random().toString());
    let newAccessTokenId = await db.insert("access_token", [
        ["user_id", user.id],
        ["access_token", access_token],
        ["created_date", config.getCurrentDate()]
    ]);

    res.json({"status": 0, "access_token": access_token}); return;
});

router.post('/checkValidAccessToken', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        status: [0 -> OK, 1 -> Not valid]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "customer");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }
    res.json({"status": 0}); return;
});

router.post('/checkAccessTokenSuperUser', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        status: [0 -> OK, 1 -> Not valid]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }
    res.json({"status": 0}); return;
});

router.post('/logout', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        status: [0 -> OK, 1 -> Cant logout]
    } */

    let canLogout = await db.removes("access_token", [["access_token = ", req.body.access_token]]);
    if (!canLogout) {
        res.json({"status": 1}); return;
    }
    res.json({"status": 0}); return;
});

// Members
router.post('/getMembersData', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        members_list: [],
        members_count: 0
        status: [0 -> OK, 1 -> Cant get members data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let members_count = await db.count("users", [
        ["usertype = ", "customer"], 
        ["trash = ", 0]
    ]);

    let members_list = await db.gets("users", [
        ["usertype = ", "customer"], 
        ["trash = ", 0]
    ], ` LIMIT 7 OFFSET ${7 * (req.body.page - 1)}`);

    res.json({"members_list": members_list, "members_count": members_count, "status": 0}); return;
});

router.post('/getMemberData', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        member: [],
        status: [0 -> OK, 1 -> Cant get members data]
    } */

    let access_token = await db.get("access_token", [
        ["access_token = ", req.body.access_token]
    ]);

    if (!access_token) {
        res.json({"status": 1}); return;
    }

    let member = await db.get("users", [
        ["id = ", access_token.user_id]
    ]);

    res.json({"member": member, "status": 0}); return;
});

// Customer update themself
router.post('/updateCustomerData', async(req, res) => {
    /* Req: {
        access_token: "",
        username: "",
        email: "",
        password: "",
        password_retype: "",
        gender: 0,
        address: ""
    }
    Res: {
        status: [0 -> OK, 1 -> Cant update member data]
    } */

    let access_token = await db.get("access_token", [
        ["access_token = ", req.body.access_token]
    ]);

    if (!access_token) {
        res.json({"status": 1}); return;
    }

    let updateObject = [
        ["email", req.body.email],
        ["gender", req.body.gender],
        ["address", req.body.address],
        ["updated_date", config.getCurrentDate()]
    ];

    if (req.body.password != "") {
        updateObject.push(["password", sha1(req.body.password)]);
    }    

    let updated = await db.update("users", updateObject , [
        ["id = ", access_token.user_id]
    ]);

    if (!updated) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
    
});

// Admin update
router.post('/updateMemberData', async (req, res) => {
    /* Req: {
        id,
        email,
        username,
        gender,
        birthday,
        address,
        access_token
    }
    Res: {
        members_list: []
        status: [0 -> OK, 1 -> Cant update members data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let updated = await db.update("users", [
        ["email", req.body.email],
        ["username", req.body.username],
        ["gender", req.body.gender],
        ["birthday", req.body.birthday],
        ["address", req.body.address],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "customer"]
    ]);

    if (!updated) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/resetMemberPassword', async (req, res) => {
    /* Req: {
        id,
        access_token
    }
    Res: {
        members_list: []
        status: [0 -> OK, 1 -> Cant reset member password]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let reset = await db.update("users", [
        ["password", sha1("12345")],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "customer"]
    ]);

    if (!reset) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/removeMember', async (req, res) => {
    /* Req: {
        id,
        access_token
    }
    Res: {
        members_list: []
        status: [0 -> OK, 1 -> Cant remove this member]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let reset = await db.update("users", [
        ["trash", 1],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "customer"]
    ]);

    if (!reset) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

// Users
router.post('/getUsersData', async(req, res) => {
    /* Req: {
        access_token: "",
    }
    Res: {
        users_list: []
        status: [0 -> OK, 1 -> Cant get members data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let users_count = await db.count("users", [
        ["usertype = ", "superuser"], 
        ["trash = ", 0]
    ]);

    let users_list = await db.gets("users", [
        ["usertype = ", "superuser"], 
        ["trash = ", 0]
    ], ` LIMIT 7 OFFSET ${7 * (req.body.page - 1)}`);

    res.json({"users_list": users_list, "status": 0, "users_count": users_count}); return;
});

router.post('/updateUserData', async (req, res) => {
    /* Req: {
        id,
        email,
        username,
        gender,
        birthday,
        address,
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant update members data]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let updated = await db.update("users", [
        ["email", req.body.email],
        ["username", req.body.username],
        ["gender", req.body.gender],
        ["birthday", req.body.birthday],
        ["address", req.body.address],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "superuser"]
    ]);

    if (!updated) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/resetUserPassword', async (req, res) => {
    /* Req: {
        id,
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant reset member password]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let reset = await db.update("users", [
        ["password", sha1("12345")],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "superuser"]
    ]);

    if (!reset) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/removeUser', async (req, res) => {
    /* Req: {
        id,
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant remove this member]
    } */

    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let reset = await db.update("users", [
        ["trash", 1],
        ["updated_date", config.getCurrentDate()]
    ], [
        ["id = ", req.body.id],
        ["usertype = ", "superuser"]
    ]);

    if (!reset) {
        res.json({"status": 1}); return;
    }

    res.json({"status": 0});
});

router.post('/addUser', async (req, res) => {
    /* Req: {
        id,
        email,
        username,
        gender,
        birthday,
        address,
        access_token
    }
    Res: {
        status: [0 -> OK, 1 -> Cant update members data, 2 -> This email existed, 3 -> This username existed]
    } */
    
    let permission = await config.checkPermission(db, req.body.access_token, "superuser");
    if (permission == 1) {
        res.json({"status": 1}); return;
    }

    let is_existed_email = await db.get("users", [
        ["email = ", req.body.email],
        ["usertype = ", "superuser"]
    ]);
    let is_existed_username = await db.get("users", [
        ["username = ", req.body.username],
        ["usertype = ", "superuser"]
    ]);
    if (is_existed_email) {
        res.json({"status": 2}); return;
    }
    if (is_existed_username) {
        res.json({"status": 3}); return;
    }

    let insert_data = [
        ["email", req.body.email], 
        ["username", req.body.username], 
        ["password", sha1("12345")],
        ["usertype", "superuser"],
        ["gender", req.body.gender],
        ["birthday", req.body.birthday],
        ["address", req.body.address],
        ["trash", 0],
        ["created_date", config.getCurrentDate()],
        ["updated_date", config.getCurrentDate()]
    ];

    let newUserId = await db.insert("users", insert_data);
    res.json({"status": 0}); return;
});

module.exports = router;