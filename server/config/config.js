exports.port = process.env.PORT || 8080;

exports.getCurrentDate = function() {
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

exports.checkPermission = function (db, access_token, user_type) {
    // 1 -> Not valid
    // 0 -> Valid
    return new Promise(async (resolve, reject) => {
        let existed_token = await db.get("access_token", [["access_token = ", access_token]]);
        if (!existed_token) {
           resolve(1);
        }
        else {
            let user = await db.get("users", [["id = ", existed_token.user_id]]);
            if (user.usertype != user_type) {
                resolve(1);
            }
            else {
                resolve(0);
            }
        }
    });
}