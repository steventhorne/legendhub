let mysql = require("./mysql-connection");
let graphql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

// required api schemas
let itemSchema = require("./items.js");

let mobSelectSQL = `SELECT M.Id
            ,M.Name
            ,M.Xp
            ,M.AreaId
            ,A.Name AS AreaName
            ,A.EraId
            ,E.Name AS EraName
            ,M.Gold
            ,M.ModifiedOn
            ,M.ModifiedBy
            ,M.ModifiedByIP
            ,M.ModifiedByIPForward
            ,M.Notes
            ,M.Aggro`;
let mobSelectTables = `FROM Mobs M
    LEFT JOIN Areas A ON A.Id = M.AreaId
    LEFT JOIN Eras E ON E.Id = A.EraId`;

class Mob {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
        this.xp = sqlResult.Xp;
        this.areaId = sqlResult.AreaId;
        this.areaName = sqlResult.AreaName;
        this.eraId = sqlResult.EraId;
        this.eraName = sqlResult.EraName;
        this.gold = sqlResult.Gold;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedByIP = sqlResult.ModifiedByIP;
        this.modifiedByIPForward = sqlResult.ModifiedByIPForward;
        this.notes = sqlResult.Notes;
        this.aggro = sqlResult.Aggro;
    }

    getItems() {
        let mobId = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ itemSchema.selectSQL.itemSelectSQL } FROM Items WHERE MobId = ? AND Deleted = 0`,
                [mobId],
                function(error, results, fields) {
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0){
                        let items = [];
                        for (let i = 0; i < results.length; ++i)
                            items.push(new itemSchema.classes.Item(results[i]));

                        resolve(items);
                    }
                    else
                        resolve([]);
                });
        });
    }

    getHistories() {
        if (!this.id)
            return [];

        let id = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ mobSelectSQL }, MobId FROM Mobs_AuditTrail M LEFT JOIN Areas A ON A.Id = M.AreaId LEFT JOIN Eras E ON E.Id = A.EraId WHERE MobId = ? AND Deleted = 0 ORDER BY ModifiedOn DESC`,
            [id],
                function(error, results, fields){
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0){
                        let response = [];
                        for (let i = 0; i < results.length; ++i) {
                            let historyId = results[i].Id;
                            results[i].Id = results[i].MobId;
                            response.push({id: historyId, mob: new Mob(results[i])});
                        }
                        resolve(response);
                    }
                    else
                        resolve([]);
                });
        });
    }
}

let getMobById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${mobSelectSQL} ${mobSelectTables} WHERE M.Id = ? AND Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0)
                    resolve(new Mob(results[0]));
                else
                    reject(new apiUtils.NotFoundError(`Mob with id (${id}) not found.`));
            });
    });
};

let getMobs = function(searchString, eraId, areaId, sortBy, sortAsc, page, rows) {
    let noSearch = searchString == null && eraId == null && areaId == null;
    if (searchString == null)
        searchString = "";
    if (sortBy == null)
        sortBy = noSearch ? "modifiedOn" : "name";
    if (sortAsc == null)
        sortAsc = !noSearch;
    if (page == null || page < 1)
        page = 1;
    if (rows == null)
        rows = 20;

    return new Promise(function(resolve, reject) {
        // validate sorting
        let actualSortBy = "Name";
        if (sortBy === "modifiedOn" ||
            sortBy === "name" ||
            sortBy === "xp" ||
            sortBy === "gold" ||
            sortBy === "aggro")
            actualSortBy = "M." + sortBy[0].toUpperCase() + sortBy.slice(1);
        else if (sortBy === "areaName")
            actualSortBy = "A.Name";

        let sql = [mobSelectSQL, mobSelectTables, "WHERE M.Name LIKE ? AND M.Deleted = 0"];
        let placeholders = [`%${searchString}%`];
        if (eraId) {
            sql.push("AND A.EraId = ?");
            placeholders.push(eraId);
        }
        if (areaId) {
            sql.push("AND M.AreaId = ?");
            placeholders.push(areaId);
        }
        sql.push(`ORDER BY ?? ${sortAsc ? "ASC" : "DESC"} LIMIT ?, ?`);
        placeholders.push(actualSortBy, (page - 1) * rows, rows + 1);


        mysql.query(sql.join(" "), placeholders,
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < Math.min(results.length, rows); ++i) {
                        response.push(new Mob(results[i]));
                    }
                    resolve({moreResults: results.length > rows, mobs: response});
                }
                else {
                    resolve({moreResults: false, mobs: []});
                }
            });
    });
};

let getMobHistoryById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ mobSelectSQL }, MobId FROM Mobs_AuditTrail M LEFT JOIN Areas A ON A.Id = M.AreaId LEFT JOIN Eras E ON E.Id = A.EraId WHERE M.Id = ? AND M.Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let historyId = results[0].Id;
                    results[0].Id = results[0].MobId;
                    resolve({id: historyId, mob: new Mob(results[0])});
                }
                else
                    reject(new apiUtils.NotFoundError(`Mob History with id (${id}) not found.`));
            });
    });
};

let insertMob = function(req, authToken, name, xp, areaId, gold, notes, aggro) {
    if (xp == null)
        xp = 0;
    if (gold == null)
        gold = 0;
    if (aggro == null)
        aggro = false;

    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("INSERT INTO Mobs (Name, Xp, AreaId, Gold, ModifiedOn, ModifiedBy, ModifiedByIP, Notes, Aggro) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)",
                    [name, xp, areaId, gold, response.username, response.ip, notes, aggro],
                    function(error, results, fields) {
                        if (error) {
                            reject(new graphql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        apiUtils.trackPageUpdate(response.ip);
                        resolve({id: results.insertId, tokenRenewal: {token: response.token, expires: response.expires}});
                    });
            }
        ).catch(
            function(error) {
                reject(error);
            }
        );
    });
};

let updateMob = function(req, authToken, id, name, xp, areaId, gold, notes, aggro) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                let sql = ["UPDATE Mobs SET"];
                let placeholders = [];
                if (name != null) {
                    sql.push("Name = ?,");
                    placeholders.push(name);
                }
                if (xp != null) {
                    sql.push("Xp = ?,");
                    placeholders.push(xp);
                }
                if (areaId != null) {
                    sql.push("AreaId = ?,");
                    placeholders.push(areaId);
                }
                if (gold != null) {
                    sql.push("Gold = ?,");
                    placeholders.push(gold);
                }
                if (notes != null) {
                    sql.push("Notes = ?,");
                    placeholders.push(notes);
                }
                if (aggro != null) {
                    sql.push("Aggro = ?,");
                    placeholders.push(aggro);
                }

                sql.push(
                    "ModifiedOn = NOW(),",
                    "ModifiedBy = ?,",
                    "ModifiedByIP = ?",
                    "WHERE Id = ?"
                );
                placeholders.push(response.username, response.ip, id);

                mysql.query(sql.join(" "),
                    placeholders,
                    function(error, results, fields) {
                        if (error) {
                            reject(new graphql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        apiUtils.trackPageUpdate(response.ip);
                        resolve({token: response.token, expires: response.expires});
                    });
            }
        ).catch(
            function(error) {
                reject(error);
            }
        );
    });
};

let deleteMob = function(req, authToken, id) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken, true).then(
            function(response) {
                if (response.permissions.hasPermission("Mob", 0, 0, 0, 1))
                {
                    mysql.query("UPDATE Mobs SET Deleted = 1 WHERE Id = ?",
                        [id],
                        function(error, results, fields) {
                            if (error)
                                return reject(new graphql.GraphQLError(error.sqlMessage));

                            apiUtils.trackPageUpdate(response.ip);
                            return resolve({token: response.token, expires: response.expires});
                        });
                }
                else {
                    return reject(new apiUtils.UnauthorizedError());
                }
            }
        ).catch(error => reject(error));
    });
};

let revertMob = function(req, authToken, historyId) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("SELECT MobId, Name, Xp, AreaId, Gold, Notes, Aggro FROM Mobs_AuditTrail WHERE Id = ?",
                    [historyId],
                    function(error, results, fields) {
                        if (error) {
                            reject(new graphql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        if (results.length == 0) {
                            reject(new apiUtils.NotFoundError(`Mob History with id, ${historyId}, not found.`));
                            return;
                        }

                        let sql = [
                            "UPDATE Mobs M SET",
                            "M.Name = ?,",
                            "M.Xp = ?,",
                            "M.AreaId = ?,",
                            "M.Gold = ?,",
                            "M.Notes = ?,",
                            "M.Aggro = ?,",
                            "M.ModifiedOn = NOW(),",
                            "M.ModifiedBy = ?,",
                            "M.ModifiedByIP = ?",
                            "WHERE M.Id = ?"
                        ];
                        mysql.query(sql.join(" "),
                            [results[0].Name, results[0].Xp, results[0].AreaId, results[0].Gold, results[0].Notes, results[0].Aggro, response.username, response.ip, results[0].MobId],
                            function(error, revertResults, fields) {
                                if (error) {
                                    reject(new graphql.GraphQLError(error.sqlMessage));
                                    return;
                                }

                                apiUtils.trackPageUpdate(response.ip);
                                resolve({id: results[0].MobId, tokenRenewal: {token: response.token, expires: response.expires}});
                            });
                    });
            }
        ).catch(
            function(error) {
                reject(error);
            }
        );
    });
};

let mobType = new graphql.GraphQLObjectType({
    name: "Mob",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        xp: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        areaId: { type: graphql.GraphQLInt },
        areaName: { type: graphql.GraphQLString },
        eraId: { type: graphql.GraphQLInt },
        eraName: { type: graphql.GraphQLString },
        gold: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        modifiedOn: { type: new graphql.GraphQLNonNull(GraphQLDateTime) },
        modifiedBy: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        modifiedByIP: { type: graphql.GraphQLString },
        modifiedByIPForward: { type: graphql.GraphQLString },
        notes: { type: graphql.GraphQLString },
        aggro: { type: graphql.GraphQLBoolean },

        getItems: { type: new graphql.GraphQLList(itemSchema.types.itemType) },
        getHistories: { type: new graphql.GraphQLList(mobHistoryType) }
    })
});

let mobHistoryType = new graphql.GraphQLObjectType({
    name: "MobHistory",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        mob: { type: mobType }
    })
});

let mobSearchResultsType = new graphql.GraphQLObjectType({
    name: "MobSearchResult",
    fields: () => ({
        moreResults: { type: graphql.GraphQLBoolean },
        mobs: { type: new graphql.GraphQLList(mobType) }
    })
});

let qFields = {
    getMobById: {
        type: mobType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getMobById(id);
        }
    },
    getMobs: {
        type: mobSearchResultsType,
        args: {
            searchString: { type: graphql.GraphQLString },
            eraId: { type: graphql.GraphQLInt },
            areaId: { type: graphql.GraphQLInt },
            sortBy: { type: graphql.GraphQLString },
            sortAsc: { type: graphql.GraphQLBoolean },
            page: { type: graphql.GraphQLInt },
            rows: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {searchString, eraId, areaId, sortBy, sortAsc, page, rows}) {
            return getMobs(searchString, eraId, areaId, sortBy, sortAsc, page, rows);
        }
    },
    getMobHistoryById: {
        type: mobHistoryType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getMobHistoryById(id);
        }
    }
};

let mFields = {
    insertMob: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
            name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
            xp: {type: graphql.GraphQLInt},
            areaId: {type: graphql.GraphQLInt},
            gold: {type: graphql.GraphQLInt},
            notes: {type: graphql.GraphQLString},
            aggro: {type: graphql.GraphQLBoolean}
        },
        resolve: function(_, {
            authToken,
            name,
            xp,
            areaId,
            gold,
            notes,
            aggro
        }, req) {
            return insertMob(
                req,
                authToken,
                name,
                xp,
                areaId,
                gold,
                notes,
                aggro
            );
        }
    },
    updateMob: {
        type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
            id: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
            name: {type: graphql.GraphQLString},
            xp: {type: graphql.GraphQLInt},
            areaId: {type: graphql.GraphQLInt},
            gold: {type: graphql.GraphQLInt},
            notes: {type: graphql.GraphQLString},
            aggro: {type: graphql.GraphQLBoolean}
        },
        resolve: function(_, {
            authToken,
            id,
            name,
            xp,
            areaId,
            gold,
            notes,
            aggro
        }, req) {
            return updateMob(
                req,
                authToken,
                id,
                name,
                xp,
                areaId,
                gold,
                notes,
                aggro
            );
        }
    },
    revertMob: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
            historyId: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
        },
        resolve: function(_, {authToken, historyId}, req) {
            return revertMob(req, authToken, historyId);
        }
    },
    deleteMob: {
        type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
        },
        resolve: function(_, {authToken, id}, req) {
            return deleteMob(req, authToken, id);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
module.exports.types = { mobType };
module.exports.classes = { Mob };
module.exports.selectSQL = { mobSelectSQL, mobSelectTables };
