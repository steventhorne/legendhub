let mysql = require("./mysql-connection");
let syncRpc = require("sync-rpc");
let graphql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

String.prototype.format = function() {
    a = this;
    for (k in arguments) {
        a = a.replace("{" + k + "}", arguments[k]);
    }
    return a;
}

const rpcClient = syncRpc(__dirname + "/sync-mysql-worker.js");
let itemColumnsResults = rpcClient("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'legendhub' AND TABLE_NAME = 'Items'");
let itemColumns = [];
for (let i = 0; i < itemColumnsResults.length; ++i) {
    itemColumns.push({
        name: itemColumnsResults[i]["COLUMN_NAME"],
        type: itemColumnsResults[i]["DATA_TYPE"],
        nullable: itemColumnsResults[i]["IS_NULLABLE"] == "YES"
    });
}

// required api schemas
let mobSchema = require("./mobs.js");
let questSchema = require("./quests.js");

let selectOptions = {
    slot: [
      "Light",
	    "Finger",
	    "Neck",
	    "Body",
	    "Head",
	    "Face",
	    "Legs",
	    "Feet",
	    "Hands",
	    "Arms",
	    "Shield",
	    "About",
	    "Waist",
	    "Wrist",
	    "Wield",
	    "Hold",
	    "Ear",
	    "Arm",
	    "Amulet",
	    "Aux",
	    "Familiar",
	    "Other"
    ],
    alignRestriction: [
      "No Align Restriction",
      "Good Only Align",
      "Neutral Only Align",
      "Evil Only Align",
      "Non-Good Align",
      "Non-Neutral Align",
      "Non-Evil Align"
    ],
    weaponType: [
      "",
      "Bladed Weapon",
      "Piercing Weapon",
      "Blunt Weapon"
    ],
    weaponStat: [
      "",
      "Strength",
      "Dexterity",
      "Constitution"
    ]
  };

let selectShortOptions = {
    slot: [
        "Light",
        "Finger",
	    "Neck",
	    "Body",
	    "Head",
	    "Face",
	    "Legs",
	    "Feet",
	    "Hands",
	    "Arms",
	    "Shield",
	    "About",
	    "Waist",
	    "Wrist",
	    "Wield",
	    "Hold",
	    "Ear",
	    "Arm",
	    "Amulet",
	    "Aux",
	    "Familiar",
	    "Other"
    ],
    alignRestriction: [
      "     ",
      "G    ",
      "  N  ",
      "    E",
      "  N E",
      "G   E",
      "G N  "
    ],
    weaponType: [
      "",
      "Bladed",
      "Piercing",
      "Blunt"
    ],
    weaponStat: [
      "",
      "Str",
      "Dex",
      "Con"
    ]
  }

let itemSelectSQL = "SELECT ";
for (let i = 0; i < itemColumns.length; ++i) {
    if (i > 0)
        itemSelectSQL += " ,";
    itemSelectSQL += itemColumns[i].name;
}

let itemFragment = "fragment ItemAll on Item {";
for (let i = 0; i < itemColumns.length; ++i) {
    itemFragment += itemColumns[i].name[0].toLowerCase() + itemColumns[i].name.slice(1) + " ";
}
itemFragment += "}";

class Item {
    constructor(sqlResult) {
        for (let i = 0; i < itemColumns.length; ++i) {
            this[itemColumns[i].name[0].toLowerCase() + itemColumns[i].name.slice(1)] = sqlResult[itemColumns[i].name];
        }
    }

    getMob() {
        if (!this.mobId)
            return null;

        let mobId = this.mobId;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ mobSchema.selectSQL.mobSelectSQL } ${mobSchema.selectSQL.mobSelectTables} WHERE M.Id = ?`,
                [mobId],
                function(error, results, fields) {
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0)
                        resolve(new mobSchema.classes.Mob(results[0]));
                    else
                        reject(new apiUtils.NotFoundError(`Mob with id (${mobId}) not found.`));
                });
        });
    }

    getQuest() {
        if (!this.questId)
            return null;

        let questId = this.questId;
        return new Promise(function(resolve, reject) {
            mysql.query(`${questSchema.selectSQL.questSelectSQL} ${questSchema.selectSQL.questSelectTables} WHERE Q.Id = ?`,
                [questId],
                function(error, results, fields) {
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0)
                        resolve(new questSchema.classes.Quest(results[0]));
                    else
                        reject(new apiUtils.NotFoundError(`Quest with id (${questId}) not found`));
                });
        });
    }

    getHistories() {
        if (!this.id)
            return [];

        let id = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ itemSelectSQL }, ItemId FROM Items_AuditTrail WHERE ItemId = ? AND Deleted = 0 ORDER BY ModifiedOn DESC`,
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
                            results[i].Id = results[i].ItemId;
                            response.push({id: historyId, item: new Item(results[i])});
                        }
                        resolve(response);
                    }
                    else
                        resolve([]);
                });
        });
    }
}

class ItemStatCategory {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
        this.sortNumber = sqlResult.SortNumber;
    }

    getItemStatInfo() {
        if (!this.id)
            return [];

        let id = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`SELECT Id,
                Display,
                Short,
                Var,
                Type,
                FilterString,
                DefaultValue,
                NetStat,
                ShowColumnDefault,
                Editable,
                CategoryId,
                SortNumber
                FROM ItemStatInfo WHERE CategoryId = ?
                ORDER BY SortNumber ASC`,
                [id],
                function(error, results, fields) {
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0){
                        let response = [];
                        for (let i = 0; i < results.length; ++i) {
                            response.push(new ItemStatInfo(results[i]));
                        }
                        resolve(response);
                    }
                    else {
                        reject(new apiUtils.NotFoundError(`ItemStatCategory with categoryId (${id}) not found.`));
                    }
                });
        });
    }
}

class ItemStatInfo {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.display = sqlResult.Display;
        this.short = sqlResult.Short;
        this.var = sqlResult.Var;
        this.type = sqlResult.Type;
        this.filterString = sqlResult.FilterString;
        this.defaultValue = sqlResult.DefaultValue;
        this.netStat = sqlResult.NetStat;
        this.showColumnDefault = sqlResult.ShowColumnDefault;
        this.editable = sqlResult.Editable;
        this.categoryId = sqlResult.CategoryId;
        this.sortNumber = sqlResult.SortNumber;
    }

    getItemStatCategory() {
        if (!this.categoryId)
            return null;

        let categoryId = this.categoryId;
        return new Promise(function(resolve, reject) {
            mysql.query(`SELECT Id, Name, SortNumber
                FROM ItemStatCategories WHERE Id = ?
                ORDER BY SortNumber ASC`,
                [categoryId],
                function(error, results, fields) {
                    if (error) {
                        reject(new graphql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0)
                        resolve(new ItemStatCategory(results[0]));
                    else
                        reject(new apiUtils.NotFoundError(`ItemStatCategory with id (${categoryId}) not found.`));
                });
        });
    }
}

let getItemFragment = function() {
    return itemFragment;
};

let getItemById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } FROM Items WHERE Id = ? AND Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0)
                    resolve(new Item(results[0]));
                else
                    reject(new apiUtils.NotFoundError(`Item with id (${id}) not found.`));
            });
    });
};

let getItemsInIds = function(ids) {
    if (ids.length === 0)
        return [];

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } FROM Items WHERE Id IN (?) AND Deleted = 0`,
            [ids],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new Item(results[i]));
                    }
                    resolve(response);
                }
                else {
                    reject(new apiUtils.NotFoundError(`Items with ids (${ids}) not found.`));
                }
            });
    });
};

let getItemHistoryById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL }, ItemId FROM Items_AuditTrail WHERE Id = ? AND Deleted = 0`,
            [id],
            function(error, results, fields) {
                if (error)
                    return reject(new graphql.GraphQLError(error.sqlMessage));

                if (results.length > 0) {
                    let historyId = results[0].Id;
                    results[0].Id = results[0].ItemId;
                    return resolve({id: historyId, item: new Item(results[0])});
                }
                else
                    return reject(new apiUtils.NotFoundError(`Item History with id (${id}) not found.`));
            });
    });
};

let getItemsBySlotId = function(slotId) {
    if (slotId == null)
        return [];

    return new Promise(function(resolve, reject) {
        let sql = `${itemSelectSQL} FROM Items WHERE Slot = ? AND Deleted = 0 `;
        if (slotId == 15) {
            sql += "OR (Slot = 14 AND Holdable = 1) OR Slot = 10 ";
        }
        if (slotId == 14) {
            sql += "OR Slot = 15 OR Slot = 10 ";
        }
        mysql.query(`${sql}ORDER BY Name ASC`,
            [slotId],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new Item(results[i]));
                    }
                    resolve(response);
                }
                else {
                    resolve([]);
                }
            });
    });
};

let getItemStatCategories = function() {
    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Id, Name, SortNumber
            FROM ItemStatCategories
            ORDER BY SortNumber ASC`,
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new ItemStatCategory(results[i]));
                    }
                    resolve(response);
                }
                else {
                    resolve([]);
                }
            })
    })
};

let getItemStatInfo = function(categoryId, varName) {
    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Id, Display, Short, Var, Type, FilterString, DefaultValue, NetStat,
            ShowColumnDefault, Editable, CategoryId, SortNumber
            FROM ItemStatInfo WHERE (? IS NULL OR CategoryId = ?)
            AND (? IS NULL OR Var = ?)
            ORDER BY SortNumber ASC`,
            [categoryId, categoryId, varName, varName],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new ItemStatInfo(results[i]));
                    }
                    resolve(response);
                }
                else {
                    resolve([]);
                }
            });
    });
};

let getItems = function(searchString, filterString, sortBy, sortAsc, page, rows) {
    // set defaults
    let noSearch = searchString == null && filterString == null && sortBy == null;
    if (searchString == null)
        searchString = "";
    if (sortAsc == null)
        sortAsc = !noSearch;
    if (page == null || page < 1)
        page = 1;
    if (rows == null)
        rows = 20;

    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Var, FilterString FROM ItemStatInfo`,
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let filterStrings = {};
                    for (let i = 0; i < results.length; ++i) {
                        filterStrings[results[i].Var] = results[i].FilterString;
                    }

                    let filterQuery = "";
                    if (filterString) {
                        let filters = filterString.split(",");
                        for (let i = 0; i < filters.length; ++i) {
                            let filterData = filters[i].split("_");
                            let filterVar = filterData[0][0].toLowerCase() + filterData[0].slice(1);
                            let filterClause = filterStrings[filterVar];

                            if (filterClause) {
                                let mysqlVar = filterVar[0].toUpperCase() + filterVar.slice(1);
                                filterQuery += " AND (" + mysqlVar + " " + filterClause.format(filterData.slice(1)) + ")"
                            }
                        }
                    }

                    // validate sorting
                    if (sortBy == null) {
                        actualSortBy = noSearch ? "ModifiedOn" : "Name";
                    }
                    else {
                        for (let i = 0; i < results.length; ++i) {
                            if (results[i].Var.toLowerCase() === sortBy.toLowerCase())
                                actualSortBy = results[i].Var;
                        }
                    }

                    mysql.query(`${ itemSelectSQL } FROM Items WHERE Deleted = 0 AND (? = '' OR Name LIKE ?)${filterQuery} ORDER BY ${actualSortBy} ${sortAsc ? "ASC" : "DESC"} LIMIT ${(page - 1) * rows}, ${rows + 1}`,
                        [searchString, "%" + searchString + "%"],
                        function(error, results, fields) {
                            if (error) {
                                reject(new graphql.GraphQLError(error.sqlMessage));
                                return;
                            }

                            if (results.length > 0) {
                                let response = [];
                                for (let i = 0; i < Math.min(results.length, rows); ++i) {
                                    response.push(new Item(results[i]));
                                }
                                resolve({moreResults: results.length > rows, items: response});
                            }
                            else {
                                resolve({moreResults: false, items: []});
                            }
                        });
                }
                else {
                    reject(new apiUtils.NotFoundError(`ItemStatInfo not found.`));
                    return;
                }
            });
    });
};

let insertItem = function(args) {
    let statValues = {};
    let ip = auth.utils.getIPFromRequest(args["req"]);
    return new Promise(function(resolve, reject) {
        auth.utils.authToken(args["authToken"], ip).then(
            function(response) {
                let authResponse = response;

                mysql.query(`SELECT Var, DefaultValue, Type, NetStat FROM ItemStatInfo`,
                    function(error, results, fields) {
                        if (error) {
                            reject(new graphql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        if (results.length > 0) {
                            let netStat = 0;
                            for (let i = 0; i < results.length; ++i) {
                                if (args[results[i].Var] === undefined ||
                                    args[results[i].Var] === null) {
                                    // cast default value to proper type
                                    let defaultValue = null;
                                    if (results[i].Type === "int" ||
                                        results[i].Type === "decimal" ||
                                        results[i].Type === "select") {
                                        defaultValue = Number(results[i].DefaultValue);
                                    }
                                    else if (results[i].Type === "bool") {
                                        defaultValue = (results[i].DefaultValue == "1");
                                    }
                                    else {
                                        defaultValue = results[i].DefaultValue;
                                    }

                                    statValues[results[i].Var] = defaultValue;
                                }
                                else {
                                    statValues[results[i].Var] = args[results[i].Var];
                                }

                                if (results[i].NetStat !== 0) {
                                    netStat += statValues[results[i].Var] / results[i].NetStat;
                                }
                            }

                            let keys = [];
                            let values = [];
                            for (let key in statValues) {
                                if (key !== "netStat" && statValues.hasOwnProperty(key)) {
                                    keys.push(key[0].toUpperCase() + key.slice(1));
                                    values.push(statValues[key]);
                                }
                            }
                            keys.push(
                                "Notes",
                                "MobId",
                                "QuestId",
                                "NetStat",
                                "ModifiedBy",
                                "ModifiedOn",
                                "ModifiedByIP"
                            );
                            values.push(
                                args["notes"],
                                args["mobId"],
                                args["questId"],
                                netStat,
                                authResponse.username,
                                new Date(),
                                ip
                            );

                            mysql.query(`INSERT INTO Items (??) VALUES (?)`,
                                [keys, values],
                                function(error, results, fields) {
                                    if (error) {
                                        reject(new graphql.GraphQLError(error.sqlMesssage));
                                        return;
                                    }

                                    apiUtils.trackPageUpdate(ip);
                                    resolve({id: results.insertId, tokenRenewal: {token: authResponse.token, expires: authResponse.expires}});
                                });
                        }
                    });
            }
        ).catch(
            function(reason) {
                reject(new apiUtils.UnauthorizedError(reason));
            }
        );

    });
};

let updateItem = function(args) {
    let statValues = {};
    let ip = auth.utils.getIPFromRequest(args["req"]);
    return new Promise(function(resolve, reject) {
        auth.utils.authToken(args["authToken"], ip).then(
            function(response) {
                let authResponse = response;

                mysql.query(`SELECT Var, DefaultValue, Type, NetStat FROM ItemStatInfo`,
                    function(error, results, fields) {
                        if (error) {
                            reject(new graphql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        if (results.length > 0) {
                            mysql.query(`${itemSelectSQL} FROM Items WHERE Id = ?`,
                                [args["id"]],
                                function(itemError, itemResults, itemFields) {
                                    if (itemError || itemResults.length === 0) {
                                        if (itemError)
                                            reject(new graphql.GraphQLError(itemError));
                                        else
                                            reject(new apiUtils.NotFoundError("Could not find item."));
                                    }

                                    let netStat = 0;
                                    for (let i = 0; i < results.length; ++i) {
                                        if (args[results[i].Var] !== undefined &&
                                            args[results[i].Var] !== null) {
                                            statValues[results[i].Var] = args[results[i].Var];
                                            if (results[i].NetStat != 0) {
                                                netStat += args[results[i].Var] / results[i].NetStat;
                                            }
                                        }
                                        else if (results[i].NetStat != 0) {
                                            let varName = results[i].Var[0].toUpperCase() + results[i].Var.slice(1);
                                            netStat += itemResults[0][varName] / results[i].NetStat;
                                        }
                                    }

                                    let sqlParts = ["UPDATE Items SET"];
                                    let placeholders = [];
                                    let placeholderValues = [];
                                    for (let key in statValues) {
                                        if (key !== "netStat" && statValues.hasOwnProperty(key)) {
                                            placeholders.push("?? = ?");
                                            placeholderValues.push(key[0].toUpperCase() + key.slice(1));
                                            placeholderValues.push(statValues[key]);
                                        }
                                    }

                                    // Add required columns
                                    placeholders.push(
                                        "?? = ?",
                                        "?? = ?",
                                        "?? = ?",
                                        "?? = ?",
                                        "?? = ?",
                                        "?? = ?",
                                        "?? = ?"
                                    );
                                    placeholderValues.push(
                                        "Notes",
                                        args["notes"],
                                        "MobId",
                                        args["mobId"],
                                        "QuestId",
                                        args["questId"],
                                        "NetStat",
                                        netStat,
                                        "ModifiedBy",
                                        authResponse.username,
                                        "ModifiedOn",
                                        new Date(),
                                        "ModifiedByIP",
                                        ip,
                                        args["id"]
                                    );

                                    sqlParts.push(placeholders.join(", "));
                                    sqlParts.push("WHERE Id = ?");

                                    mysql.query(sqlParts.join(" "),
                                        placeholderValues,
                                        function(error, results, fields) {
                                            apiUtils.trackPageUpdate(ip);
                                            resolve({token: authResponse.token, expires: authResponse.expires});
                                        });

                                });

                        }
                    });
            }
        ).catch(
            function(reason) {
                reject(new apiUtils.UnauthorizedError(reason));
            }
        );

    });
};

let revertItem = function(req, authToken, historyId) {
    let ip = auth.utils.getIPFromRequest(req);
    return new Promise(function(resolve, reject) {
        auth.utils.authToken(authToken, ip).then(
            function(response) {
                let authResponse = response;
                mysql.query("SELECT Var, NetStat FROM ItemStatInfo",
                    function(error, results, fields) {
                        if (error || results.length === 0) {
                            if (error)
                                reject(new graphql.GraphQLError(error.sqlMessage));
                            else
                                reject(new apiUtils.NotFoundError("Item stat info not found."));
                            return;
                        }

                        mysql.query(`${itemSelectSQL}, ItemId FROM Items_AuditTrail WHERE Id = ?`,
                            [historyId],
                            function(historyError, historyResults, historyFields) {
                                if (historyError || historyResults.length === 0) {
                                    if (historyError)
                                        reject(new graphql.GraphQLError(historyError));
                                    else
                                        reject(new apiUtils.NotFoundError("Item history not found."));
                                    return;
                                }

                                let itemId = historyResults[0].ItemId;
                                let sql = ["UPDATE Items SET"];
                                let placeholderValues = [];
                                let statVar = "";
                                let netStat = 0;
                                for (let i = 0; i < results.length; ++i) {
                                    if (results[i].Var === "netStat")
                                        continue;

                                    sql.push("?? = ?,");

                                    statVar = results[i].Var[0].toUpperCase() + results[i].Var.slice(1);
                                    placeholderValues.push(`${statVar}`);
                                    placeholderValues.push(historyResults[0][statVar]);

                                    if (results[i].NetStat !== 0)
                                        netStat += historyResults[0][statVar] / results[i].NetStat;
                                }

                                sql.push("NetStat = ?,");
                                placeholderValues.push(netStat);
                                sql.push("ModifiedBy = ?,");
                                placeholderValues.push(authResponse.username);
                                sql.push("ModifiedOn = ?,");
                                placeholderValues.push(new Date());
                                sql.push("ModifiedByIP = ?");
                                placeholderValues.push(ip);
                                sql.push("WHERE Id = ?");
                                placeholderValues.push(itemId);

                                mysql.query(sql.join(" "),
                                    placeholderValues,
                                    function(error, results, fields) {
                                        if (error) {
                                            reject(new graphql.GraphQLError(error.sqlMessage));
                                            return;
                                        }

                                        apiUtils.trackPageUpdate(ip);
                                        resolve({id: itemId, tokenRenewal: {token: authResponse.token, expires: authResponse.expires}});
                                    });
                            });
                    });
            }
        ).catch(
            function(reason) {
                reject(new apiUtils.UnauthorizedError(reason));
            }
        );
    });
};

let deleteItem = function(req, authToken, id) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken, true).then(
            function(response) {
                if (response.permissions.hasPermission("Item", 0, 0, 0, 1))
                {
                    mysql.query("UPDATE Items SET Deleted = 1 WHERE Id = ?",
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

function getItemFields(withId, withDeleted, optional) {
    let fields = {};
    let t = undefined;
    for (let i = 0; i < itemColumns.length; ++i) {
        if (!withId && itemColumns[i].name === "Id")
            continue;

        if (!withDeleted && itemColumns[i].name === "Deleted")
            continue;

        switch (itemColumns[i].type) {
            case "int":
                t = graphql.GraphQLInt;
                break;
            case "decimal":
                t = graphql.GraphQLFloat;
                break;
            case "tinyint":
                t = graphql.GraphQLBoolean;
                break;
            case "varchar":
            case "text":
                t = graphql.GraphQLString;
                break;
            case "datetime":
                t = GraphQLDateTime;
                break;
            default:
                break;
        }

        if ((!optional || itemColumns[i].name === "Id")
            && !itemColumns[i].nullable
            && itemColumns[i].name !== "ModifiedBy"
            && itemColumns[i].name !== "ModifiedOn") {
            fields[itemColumns[i].name[0].toLowerCase() + itemColumns[i].name.slice(1)] = { type: new graphql.GraphQLNonNull(t) };
        }
        else {
            fields[itemColumns[i].name[0].toLowerCase() + itemColumns[i].name.slice(1)] = { type: t };
        }
    }

    return fields;
};

let itemType = new graphql.GraphQLObjectType({
    name: "Item",
    fields: () => {
        let f = getItemFields(true, true);

        f.getMob = { type: mobSchema.types.mobType },
        f.getQuest = { type: questSchema.types.questType },
        f.getHistories = { type: new graphql.GraphQLList(itemHistoryType) }

        return f;
    }
});

let itemStatCategoryType = new graphql.GraphQLObjectType({
    name: "ItemCategory",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)  },
        sortNumber: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },

        getItemStatInfo: { type: new graphql.GraphQLList(itemStatInfoType) }
    })
});

let itemStatInfoType = new graphql.GraphQLObjectType({
    name: "ItemStatInfo",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        display: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        short: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        var: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        type: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        filterString: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        defaultValue: { type: graphql.GraphQLString },
        netStat: { type: graphql.GraphQLFloat },
        showColumnDefault: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
        editable: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
        categoryId: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        sortNumber: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },

        getItemStatCategory: { type: itemStatCategoryType }
    })
});

let itemHistoryType = new graphql.GraphQLObjectType({
    name: "ItemHistory",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        item: { type: itemType }
    })
});

let itemSearchResultsType = new graphql.GraphQLObjectType({
    name: "ItemSearchResult",
    fields: () => ({
        moreResults: { type: graphql.GraphQLBoolean },
        items: { type: new graphql.GraphQLList(itemType) }
    })
});

let qFields = {
    getItemFragment: {
        type: graphql.GraphQLString,
        args: {},
        resolve: function(_) {
            return getItemFragment();
        }
    },
    getItemById: {
        type: itemType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getItemById(id);
        }
    },
    getItemsInIds: {
        type: new graphql.GraphQLList(itemType),
        args: {
            ids: { type: new graphql.GraphQLList(graphql.GraphQLInt) }
        },
        resolve: function(_, {ids}) {
            return getItemsInIds(ids);
        }
    },
    getItemHistoryById: {
        type: itemHistoryType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getItemHistoryById(id);
        }
    },
    getItemsBySlotId: {
        type: new graphql.GraphQLList(itemType),
        args: {
            slotId: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {slotId}) {
            return getItemsBySlotId(slotId);
        }
    },
    getItemStatCategories: {
        type: new graphql.GraphQLList(itemStatCategoryType),
        resolve: function(_) {
            return getItemStatCategories();
        }
    },
    getItemStatInfo: {
        type: new graphql.GraphQLList(itemStatInfoType),
        args: {
            categoryId: { type: graphql.GraphQLInt },
            varName: { type: graphql.GraphQLString }
        },
        resolve: function(_, {categoryId, varName}) {
            return getItemStatInfo(categoryId, varName);
        }
    },
    getItems: {
        type: itemSearchResultsType,
        args: {
            searchString: { type: graphql.GraphQLString },
            filterString: { type: graphql.GraphQLString },
            sortBy: { type: graphql.GraphQLString },
            sortAsc: { type: graphql.GraphQLBoolean },
            page: { type: graphql.GraphQLInt },
            rows: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {searchString, filterString, sortBy, sortAsc, page, rows}) {
            return getItems(searchString, filterString, sortBy, sortAsc, page, rows);
        }
    }
};

let insertItemArgs = getItemFields(false, false);
insertItemArgs.authToken = { type: new graphql.GraphQLNonNull(graphql.GraphQLString) };

let updateItemArgs = getItemFields(false, false, true);
updateItemArgs.authToken = { type: new graphql.GraphQLNonNull(graphql.GraphQLString) };
updateItemArgs.id = { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) };

let mFields = {
    insertItem: {
        type: auth.types.idMutationResponseType,
        args: insertItemArgs,
        resolve: function(_, itemArgs, req) {
            itemArgs.req = req;
            return insertItem(itemArgs);
        }
    },
    updateItem: {
        type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: updateItemArgs,
        resolve: function(_, itemArgs, req) {
            itemArgs.req = req;
            return updateItem(itemArgs);
        }
    },
    revertItem: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            historyId: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
        },
        resolve: function(_, {authToken, historyId}, req) {
            return revertItem(req, authToken, historyId);
        }
    },
    deleteItem: {
        type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
        },
        resolve: function(_, {authToken, id}, req) {
            return deleteItem(req, authToken, id);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
module.exports.types = { itemType, itemHistoryType };
module.exports.classes = { Item };
module.exports.selectSQL = { itemSelectSQL };
module.exports.fragment = itemFragment;
module.exports.constants = { selectOptions, selectShortOptions };
