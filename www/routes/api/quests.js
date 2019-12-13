let mysql = require("./mysql-connection");
let gql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

// required api schemas
let itemSchema = require("./items.js");

let questSelectSQL = `SELECT Q.Id
    ,Q.Title
    ,Q.AreaId
    ,A.Name AS AreaName
    ,A.EraId
    ,E.Name AS EraName
    ,Q.Content
    ,Q.Whoises
    ,Q.Stat
    ,Q.ModifiedOn
    ,Q.ModifiedBy
    ,Q.ModifiedByIP
    ,Q.ModifiedByIPForward`;
let questSelectTables = `FROM Quests Q
    LEFT JOIN Areas A ON A.Id = Q.AreaId
    LEFT JOIN Eras E ON E.Id = A.EraId`;

class Quest {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.title = sqlResult.Title;
        this.areaId = sqlResult.AreaId;
        this.areaName = sqlResult.AreaName;
        this.eraId = sqlResult.EraId;
        this.eraName = sqlResult.EraName;
        this.content = sqlResult.Content;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedByIP = sqlResult.ModifiedByIP;
        this.modifiedByIPForward = sqlResult.ModifiedByIPForward;
        this.whoises = sqlResult.Whoises;
        this.stat = sqlResult.Stat;
    }

    getItems() {
        let questId = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ itemSchema.selectSQL.itemSelectSQL } FROM Items WHERE QuestId = ? AND Deleted = 0`,
                [questId],
                function(error, results, fields) {
                    if (error)
                        reject(error);

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
            mysql.query(`${questSelectSQL}, QuestId FROM Quests_AuditTrail Q LEFT JOIN Areas A ON A.Id = Q.AreaId LEFT JOIN Eras E ON E.Id = A.EraId WHERE QuestId = ? AND Q.Deleted = 0 ORDER BY ModifiedOn DESC`,
                [id],
                function(error, results, fields) {
                    if (error) {
                        reject(new gql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0) {
                        let response = [];
                        for (let i = 0; i < results.length; ++i) {
                            let historyId = results[i].Id;
                            results[i].Id = results[i].QuestId;
                            response.push({id: historyId, quest: new Quest(results[i])});
                        }
                        resolve(response);
                    }
                    else
                        resolve([]);
                });
        });
    }
}

let getQuestById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${questSelectSQL} ${questSelectTables} WHERE Q.Id = ? AND Q.Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0)
                    resolve(new Quest(results[0]));
                else
                    reject(new apiUtils.NotFoundError(`Quest with id (${id}) not found.`));
            });
    });
};

let getQuests = function(searchString, eraId, areaId, stat, sortBy, sortAsc, page, rows) {
    let noSearch = searchString == null && eraId == null && areaId == null;
    if (searchString == null)
        searchString = "";
    if (sortBy == null)
        sortBy = noSearch ? "modifiedOn" : "title";
    if (sortAsc == null)
        sortAsc = !noSearch;
    if (page == null || page < 1)
        page = 1;
    if (rows == null)
        rows = 20;

    return new Promise(function(resolve, reject) {
        // validate sorting
        let actualSortBy = "Title";
        if (sortBy === "modifiedOn" ||
            sortBy === "title")
            actualSortBy = "Q." + sortBy[0].toUpperCase() + sortBy.slice(1);
        else if (sortBy === "areaName")
            actualSortBy = "A.Name";

        let likeSearchString = `%${searchString}%`;
        let sql = [questSelectSQL, questSelectTables, "WHERE Q.Deleted = 0 AND (Q.Title LIKE ? OR Q.Content LIKE ? OR Q.Whoises LIKE ? OR A.Name LIKE ?)"];
        let placeholders = [likeSearchString, likeSearchString, likeSearchString, likeSearchString];
        if (eraId) {
            sql.push("AND A.EraId = ?");
            placeholders.push(eraId);
        }
        if (areaId) {
            sql.push("AND Q.AreaId = ?");
            placeholders.push(areaId);
        }
        if (stat) {
            sql.push("AND Q.Stat = ?");
            placeholders.push(stat);
        }
        sql.push(`ORDER BY ?? ${sortAsc ? "ASC" : "DESC"} LIMIT ?, ?`);
        placeholders.push(actualSortBy, (page - 1) * rows, rows + 1);

        mysql.query(sql.join(" "), placeholders,
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < Math.min(results.length, rows); ++i) {
                        response.push(new Quest(results[i]));
                    }
                    resolve({moreResults: results.length > rows, quests: response});
                }
                else {
                    resolve({moreResults: false, quests: []});
                }
            });
    });
};

let getQuestHistoryById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${questSelectSQL}, QuestId FROM Quests_AuditTrail Q LEFT JOIN Areas A ON A.Id = Q.AreaId LEFT JOIN Eras E on E.Id = A.EraId WHERE Q.Id = ? AND Q.Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let historyId = results[0].Id;
                    results[0].Id = results[0].QuestId;
                    resolve({id: historyId, quest: new Quest(results[0])});
                }
                else
                    reject(new apiUtils.NotFoundError(`Quest History with id, ${id}, not found.`));
            });
    });
};

let insertQuest = function(req, authToken, title, areaId, content, whoises, stat) {
    if (content == null)
        content = "";
    if (whoises == null)
        whoises = "";
    if (stat == null)
        stat = false;

    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("INSERT INTO Quests(Title, AreaId, Content, Whoises, Stat, ModifiedOn, ModifiedBy, ModifiedByIP) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)",
                    [title, areaId, content, whoises, stat, response.username, response.ip],
                    function(error, results, fields) {
                        if (error) {
                            reject(new gql.GraphQLError(error.sqlMessage));
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

let updateQuest = function(req, authToken, id, title, areaId, content, whoises, stat) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                let sql = ["UPDATE Quests SET"];
                let placeholders = [];
                if (title != null) {
                    sql.push("Title = ?,");
                    placeholders.push(title);
                }
                if (areaId != null) {
                    sql.push("AreaId = ?,");
                    placeholders.push(areaId);
                }
                if (content != null) {
                    sql.push("Content = ?,");
                    placeholders.push(content);
                }
                if (whoises != null) {
                    sql.push("Whoises = ?,");
                    placeholders.push(whoises);
                }
                if (stat != null) {
                    sql.push("Stat = ?,");
                    placeholders.push(stat);
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
                            reject(new gql.GraphQLError(error.sqlMessage));
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

let revertQuest = function(req, authToken, historyId) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("SELECT QuestId, Title, AreaId, Content, Whoises, Stat FROM Quests_AuditTrail WHERE Id = ?",
                    [historyId],
                    function(error, results, fields) {
                        if (error) {
                            reject(new gql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        if (results.length == 0) {
                            reject(new apiUtils.NotFoundError(`Quest History with id, ${historyId}, not found.`));
                            return;
                        }

                        let sql = [
                            "UPDATE Quests Q SET",
                            "Q.Title = ?,",
                            "Q.AreaId = ?,",
                            "Q.Content = ?,",
                            "Q.Whoises = ?,",
                            "Q.Stat = ?,",
                            "Q.ModifiedOn = NOW(),",
                            "Q.ModifiedBy = ?,",
                            "Q.ModifiedByIP = ?",
                            "WHERE Q.Id = ?"
                        ];
                        mysql.query(sql.join(" "),
                            [results[0].Title, results[0].AreaId, results[0].Content, results[0].Whoises, results[0].Stat, response.username, response.ip, results[0].QuestId],
                            function(error, revertResults, fields) {
                                if (error) {
                                    reject(new gql.GraphQLError(error.sqlMessage));
                                    return;
                                }

                                apiUtils.trackPageUpdate(response.ip);
                                resolve({id: results[0].QuestId, tokenRenewal: {token: response.token, expires: resopnse.expires}});
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

let deleteQuest = function(req, authToken, id) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken, true).then(
            function(response) {
                if (response.permissions.hasPermission("Quest", 0, 0, 0, 1))
                {
                    mysql.query("UPDATE Quests SET Delete = 1 WHERE Id = ?",
                        [id],
                        function(error, results, fields) {
                            if (error)
                                return reject(new gql.GraphQLError(error.sqlMessage));

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

let questType = new gql.GraphQLObjectType({
    name: "Quest",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        title: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        areaId: { type: gql.GraphQLInt },
        areaName: { type: gql.GraphQLString },
        eraId: { type: gql.GraphQLInt },
        eraName: { type: gql.GraphQLString },
        content: { type: gql.GraphQLString },
        whoises: { type: gql.GraphQLString },
        stat: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
        modifiedOn: { type: new gql.GraphQLNonNull(GraphQLDateTime) },
        modifiedBy: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        modifiedByIP: { type: gql.GraphQLString },
        modifiedByIPForward: { type: gql.GraphQLString },

        getItems: { type: new gql.GraphQLList(itemSchema.types.itemType) },
        getHistories: { type: new gql.GraphQLList(questHistoryType) }
    })
});

let questHistoryType = new gql.GraphQLObjectType({
    name: "QuestHistory",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        quest: { type: questType }
    })
});

let questSearchResultsType = new gql.GraphQLObjectType({
    name: "QuestSearchResult",
    fields: () => ({
        moreResults: { type: gql.GraphQLBoolean },
        quests: { type: new gql.GraphQLList(questType) }
    })
});

let qFields = {
    getQuestById: {
        type: questType,
        args: {
            id: { type: gql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getQuestById(id);
        }
    },
    getQuests: {
        type: questSearchResultsType,
        args: {
            searchString: { type: gql.GraphQLString },
            eraId: { type: gql.GraphQLInt },
            areaId: { type: gql.GraphQLInt },
            stat: { type: gql.GraphQLBoolean },
            sortBy: { type: gql.GraphQLString },
            sortAsc: { type: gql.GraphQLBoolean },
            page: { type: gql.GraphQLInt },
            rows: { type: gql.GraphQLInt }
        },
        resolve: function(_, {searchString, eraId, areaId, stat, sortBy, sortAsc, page, rows}) {
            return getQuests(searchString, eraId, areaId, stat, sortBy, sortAsc, page, rows);
        }
    },
    getQuestHistoryById: {
        type: questHistoryType,
        args: {
            id: { type: gql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getQuestHistoryById(id);
        }
    }
};

let mFields = {
    insertQuest: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            title: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            areaId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
            content: {type: gql.GraphQLString},
            whoises: {type: gql.GraphQLString},
            stat: {type: gql.GraphQLBoolean}
        },
        resolve: function(_, {
            authToken,
            title,
            areaId,
            content,
            whoises,
            stat
        }, req) {
            return insertQuest(
                req,
                authToken,
                title,
                areaId,
                content,
                whoises,
                stat
            );
        }
    },
    updateQuest: {
        type: new gql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
            title: {type: gql.GraphQLString},
            areaId: {type: gql.GraphQLInt},
            content: {type: gql.GraphQLString},
            whoises: {type: gql.GraphQLString},
            stat: {type: gql.GraphQLBoolean}
        },
        resolve: function(_, {
            authToken,
            id,
            title,
            areaId,
            content,
            whoises,
            stat
        }, req) {
            return updateQuest(req, authToken, id, title, areaId, content, whoises, stat);
        }
    },
    revertQuest: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            historyId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)}
        },
        resolve: function(_, {authToken, historyId}, req) {
            return revertQuest(req, authToken, historyId);
        }
    },
    deleteQuest: {
        type: new gql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)}
        },
        resolve: function(_, {authToken, id}, req) {
            return deleteQuest(req, authToken, id);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
module.exports.types = { questType };
module.exports.classes = { Quest };
module.exports.selectSQL = { questSelectSQL, questSelectTables };
