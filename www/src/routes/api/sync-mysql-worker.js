let mysql = require("./mysql-connection");

function init(connection) {
    return function (query) {
        return new Promise(function(resolve, reject) {
            mysql.query(
                query,
                [],
                function(error, results, fields) {
                    if (error) {
                        reject(error);
                    }

                    resolve(results);
                }
            );
        });
    }
};

module.exports = init;
