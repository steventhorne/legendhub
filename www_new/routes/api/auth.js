let mysql = require("./mysql-connection");
let gql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");
let phpPass = require("node-php-password");
let crypto = require("crypto");
let apiUtils = require("./utils");

let getIPFromRequest = function(request) {
    return (request.headers['x-forwarded-for'] || "").split(",")[0];
}

let authLogin = function(username, password, stayLoggedIn, ip) {
    if (apiUtils.isIPBlocked(ip))
        return new gql.GraphQLError(message="Too many failed attempts. Try again later.");

    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Id, Password, Banned FROM Members WHERE Username = ?`,
            [username],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(message=error));
                    return;
                }

                if (results.length > 0) {
                    for (let i = 0; i < results.length; ++i) { // TODO: log system error if more than 1 result.
                        if (phpPass.verify(password, results[i].Password)) {
                            if (results[i].Banned) {
                                reject(new gql.GraphQLError(message="This account has been locked."));
                                return;
                            }

                            mysql.query(`UPDATE Members SET LastLoginDate = NOW(), LastLoginIP = ? WHERE Id = ?`,
                                [phpPass.hash(ip), results[i].Id],
                                function(error, updateResults, fields) {});

                            let token = crypto.randomBytes(24).toString("hex");
                            let selector = crypto.randomBytes(6).toString("hex");
                            let tokenHash = crypto.createHash("sha256").update(token).digest("hex");

                            let placeholderValues = [selector, tokenHash, results[i].Id, stayLoggedIn];
                            let futureDate = new Date();
                            if (stayLoggedIn)
                                futureDate.setDate(futureDate.getDate() + 30);
                            else
                                futureDate.setDate(futureDate.getDate() + 1);
                            placeholderValues.push(futureDate);

                            mysql.query(`INSERT INTO AuthTokens (Selector, HashedValidator, MemberId, StayLoggedIn, Expires) VALUES (?, ?, ?, ?, ?)`,
                                [selector, tokenHash, results[i].Id],
                                function(error, insertResults, fields) {});

                            resolve({token: `${selector}-${token}`, expires: futureDate});
                            return;
                        }
                    }

                    apiUtils.trackAttempt("login", ip, 3, 20, 300);
                    reject(new gql.GraphQLError(message="Invalid username or password."));
                }
                else {
                    apiUtils.trackAttempt("login", ip, 3, 20, 300);
                    reject(new gql.GraphQLError(message="Invalid username or password."));
                }
            });
    });
};

let authToken = function(token, ip, renew) {
    if (renew === undefined)
        renew = true;

    return new Promise(function(resolve, reject) {
        let tokenInfo = token.split("-");
        mysql.query(`SELECT AT.Id, M.Id AS MemberId, M.Username, AT.HashedValidator, AT.Expires, AT.StayLoggedIn, M.Banned
            FROM AuthTokens AT
            JOIN Members M ON M.Id = AT.MemberId
            WHERE M.Banned = 0 AND AT.Expires > NOW() AND
            AT.Selector = ?`,
            [tokenInfo[0]],
            function(error, results, fields) {
                if (error) {
                    reject(error);
                    return;
                }

                for (let i = 0; i < results.length; ++i) {
                    let tokenHash = crypto.createHash("sha256").update(tokenInfo[1]).digest("hex");
                    if (tokenHash === results[i].HashedValidator) {
                        let stayLoggedIn = results[i].StayLoggedIn;
                        let expires = results[i].Expires;

                        mysql.query(`UPDATE Members SET LastLoginDate = NOW(), LastLoginIP = ? WHERE Id = ?`,
                                [phpPass.hash(ip), results[i].MemberId],
                                function(error, updateResults, fields) {});

                        if (renew) {
                            let newToken = crypto.randomBytes(24).toString("hex");
                            let newSelector = crypto.randomBytes(6).toString("hex");
                            let newTokenHash = crypto.createHash("sha256").update(newToken).digest("hex");

                            let placeholderValues = [newSelector, newTokenHash, results[i].MemberId, stayLoggedIn];
                            let futureDate = expires;
                            if (stayLoggedIn) {
                                futureDate = new Date();
                                futureDate.setDate(futureDate.getDate() + 30);
                            }
                            placeholderValues.push(futureDate);

                            mysql.query(`INSERT INTO AuthTokens (Selector, HashedValidator, MemberId, StayLoggedIn, Expires) VALUES (?, ?, ?, ?, ?)`,
                                placeholderValues,
                                function(error, insertResults, fields) {
                                    mysql.query(`DELETE FROM AuthTokens WHERE Id = ?`,
                                        [results[i].Id],
                                        function(error, deleteResults, fields) {});
                                });

                            console.log(`${newSelector}-${newToken}`);

                            resolve({memberId: results[i].MemberId, username: results[i].Username, token: `${newSelector}-${newToken}`, expires: futureDate});
                        }
                        else {
                            resolve({memberId: results[i].MemberId, username: results[i].Username, token: token, expires: expires})
                        }

                        return;
                    }
                }

                reject("Invalid Token");
            });
    });
};

let register = function(username, password, ip) {
    if (apiUtils.isIPBlocked(ip))
        return new gql.GraphQLError(message="Too many attempts. Try again later.");

    let cleanUsername = username.replace(/[^A-Za-z0-9]*/g, "");
    if (cleanUsername.toLowerCase() === "dataimport")
        return new gql.GraphQLError("Username taken.");
    if (cleanUsername.length < 5 || cleanUsername.length > 25)
        return new gql.GraphQLError("Username must be between 5 and 25 characters.");
    if (password.length < 8)
        return new gql.GraphQLError("Password must be larger than 8 characters.");

    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Id FROM BannedIPs WHERE Pattern = ?`,
            [ip],
            function(error, results, fields) {
                if (results.length > 0) {
                    reject(new gql.GraphQLError("Invalid username."));
                }
                else {
                    mysql.query(`SELECT Id FROM Members WHERE Username = ?`,
                        [username],
                        function(error, results, fields) {
                            if (results.length > 0) {
                                reject(new gql.GraphQLError("Username taken."));
                            }
                            else {
                                let passwordHash = phpPass.hash(password);
                                mysql.query(`INSERT INTO Members (Username, Password) VALUES (?, ?)`,
                                    [username, passwordHash],
                                    function(error, results, fields) {
                                        if (error) {
                                            reject(new gql.GraphQLError(error));
                                            return;
                                        }

                                        let memberId = results.insertId;
                                        mysql.query(`INSERT INTO MemberRoleMap (MemberId, RoleId) VALUES (?, ?)`,
                                            [memberId, 2],
                                            function(error, results, fields) {});

                                        mysql.query(`INSERT INTO NotificationSettings (MemberId) VALUES (?)`,
                                            [memberId],
                                            function(error, results, fields) {});

                                        apiUtils.trackAttempt("register", ip, 1, 1, 60*60*24);
                                        resolve(true);
                                    });
                            }
                        });
                }
            });
    });
};

let tokenRenewalType = new gql.GraphQLObjectType({
    name: "TokenRenewal",
    fields: () => ({
        token: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        expires: { type: new gql.GraphQLNonNull(GraphQLDateTime) }
    })
});

let mFields = {
    authLogin: {
        type: new gql.GraphQLNonNull(tokenRenewalType),
        args: {
            username: {type: gql.GraphQLString},
            password: {type: gql.GraphQLString},
            stayLoggedIn: {type: gql.GraphQLBoolean}
        },
        resolve: function(_, {username, password, stayLoggedIn}, req) {
            return authLogin(username, password, stayLoggedIn, getIPFromRequest(req));
        }
    },
    register: {
        type: new gql.GraphQLNonNull(gql.GraphQLBoolean),
        args: {
            username: {type: gql.GraphQLString},
            password: {type: gql.GraphQLString}
        },
        resolve: function(_, {username, password}, req) {
            return register(username, password, getIPFromRequest(req));
        }
    }
};

module.exports.mutationFields = mFields;
module.exports.types = { tokenRenewalType };
module.exports.utils = { getIPFromRequest, authLogin, authToken };
