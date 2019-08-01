let mysql = require("mysql")

let pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

module.exports = pool;
