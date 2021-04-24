const mysql = require('mysql');

let connection = mysql.createConnection({
    socketPath: "/cloudsql/resolute-vault-282409:asia-southeast1:root",
    user: "root",
    password: "mysql",
    database: "db_sfcs"
});

// let connection = mysql.createConnection({
//     host: "localhost",
//     port: 7777,
//     user: "root",
//     password: "mysql",
//     database: "db_sfcs"
// });

connection.connect(function (err) {
    if (err) throw err;
});

exports.connection = connection;

exports.get = function(tableName, where) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${tableName} WHERE 1 = 1`;
        whereValues = [];
        where.forEach(function(element) {
            query += ` AND ${element[0]} ?`;
            whereValues.push(element[1]);
        });
        query += " ORDER BY id DESC";
        
        connection.query(query, whereValues, function(err, result) {
            if (err) reject(err);
            else resolve(result[0]);
        });
    });
    
}

exports.count = function(tableName, where) {
    return new Promise((resolve, reject) => {
        let query = `SELECT COUNT(id) FROM ${tableName} WHERE 1 = 1`;
        whereValues = [];
        where.forEach(function(element) {
            query += ` AND ${element[0]} ?`;
            whereValues.push(element[1]);
        });
        
        connection.query(query, whereValues, function(err, result) {
            if (err) reject(err);
            else resolve(result[0]['COUNT(id)']);
        });
    });
}

exports.gets = function(tableName, where, rightTerm) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${tableName} WHERE 1 = 1`;
        whereValues = [];
        where.forEach(function(element) {
            query += ` AND ${element[0]} ?`;
            whereValues.push(element[1]);
        });

        query += " ORDER BY id DESC";

        if (rightTerm) {
            query += rightTerm;
        }
        
        connection.query(query, whereValues, function(err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

exports.search = function(tableName, orTerm, whereTerm) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${tableName} WHERE (1 != 1`;
        whereValues = [];
        orTerm.forEach(function(element) {
            query += ` OR ${element[0]} LIKE ?`;
            whereValues.push(element[1]);
        });
        query += ")";

        if (whereTerm) {
            query += whereTerm;
        }

        query += " ORDER BY id DESC";
        
        connection.query(query, whereValues, function(err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

exports.insert = function(tableName, data) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO ${tableName} (`;
        dataValues = [];
        valuesString = "(";
        for(let i = 0; i < data.length; ++i) {
            query += `${data[i][0]}`;
            if (i != data.length - 1) {
                query += ",";
                valuesString += "?,";
            }
            else {
                query += ")";
                valuesString += "?)";
            }
            dataValues.push(data[i][1]);
        }
        query += ` VALUES ${valuesString}`;

        connection.query(query, dataValues, function(err, result) {
            if (err) reject(err);
            else resolve(result.insertId);
        });
    });
}

exports.update = function(tableName, data, where) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE ${tableName} SET `;
        valuesArray = [];
        for(let i = 0; i < data.length; ++i) {
            query += `${data[i][0]} = ?`;
            if (i != data.length - 1) {
                query += ",";
            }
            else {
                query += " WHERE 1 = 1";
            }
            valuesArray.push(data[i][1]);
        }
        where.forEach(function(element) {
            query += ` AND ${element[0]} ?`;
            valuesArray.push(element[1]);
        }); 

        connection.query(query, valuesArray, function(err, result) {
            if (err) reject(err);
            else resolve("OK");
        });
    });
}

exports.removes = function(tableName, where) {
    return new Promise((resolve, reject) => {
        let query = `DELETE FROM ${tableName} WHERE 1 = 1`;
        whereValues = [];
        where.forEach(function(element) {
            query += ` AND ${element[0]} ?`;
            whereValues.push(element[1]);
        });
        
        connection.query(query, whereValues, function(err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
} 