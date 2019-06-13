let mysql = require("./mysql-connection");
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

// required api schemas
let mobSchema = require("./mobs.js");
let questSchema = require("./quests.js");
let itemColumns = [
    {name: "Id", type: "INT"},
    {name: "Name", type: "VARCHAR"},
    {name: "Slot", type: "INT"},
    {name: "Strength", type: "INT"},
    {name: "Mind", type: "INT"},
    {name: "Dexterity", type: "INT"},
    {name: "Constitution", type: "INT"},
    {name: "Perception", type: "INT"},
    {name: "Spirit", type: "INT"},
    {name: "Ac", type: "INT"},
    {name: "Hit", type: "INT"},
    {name: "Dam", type: "INT"},
    {name: "Hp", type: "INT"},
    {name: "Hpr", type: "INT"},
    {name: "Ma", type: "INT"},
    {name: "Mar", type: "INT"},
    {name: "Mv", type: "INT"},
    {name: "Mvr", type: "INT"},
    {name: "Spelldam", type: "INT"},
    {name: "Spellcrit", type: "INT"},
    {name: "ManaReduction", type: "INT"},
    {name: "Mitigation", type: "INT"},
    {name: "Accuracy", type: "INT"},
    {name: "Ammo", type: "INT"},
    {name: "TwoHanded", type: "TINYINT"},
    {name: "Quality", type: "INT"},
    {name: "MaxDam", type: "INT"},
    {name: "AvgDam", type: "INT"},
    {name: "MinDam", type: "INT"},
    {name: "Parry", type: "INT"},
    {name: "Holdable", type: "TINYINT"},
    {name: "Rent", type: "INT"},
    {name: "Value", type: "INT"},
    {name: "Weight", type: "DECIMAL"},
    {name: "SpeedFactor", type: "INT"},
    {name: "Notes", type: "VARCHAR"},
    {name: "ModifiedBy", type: "VARCHAR"},
    {name: "ModifiedOn", type: "DATETIME"},
    {name: "UniqueWear", type: "TINYINT"},
    {name: "ModifiedByIP", type: "VARCHAR"},
    {name: "ModifiedByIPForward", type: "VARCHAR"},
    {name: "AlignRestriction", type: "INT"},
    {name: "Bonded", type: "TINYINT"},
    {name: "Casts", type: "VARCHAR"},
    {name: "Level", type: "INT"},
    {name: "NetStat", type: "DECIMAL"},
    {name: "Concentration", type: "INT"},
    {name: "RangedAccuracy", type: "INT"},
    {name: "MobId", type: "INT"},
    {name: "QuestId", type: "INT"},
    {name: "WeaponType", type: "INT"},
    {name: "WeaponStat", type: "INT"},
    {name: "IsLight", type: "TINYINT"},
    {name: "IsHeroic", type: "TINYINT"}
];

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

let itemFragment = "fragment ItemAll on Item {\n";
for (let i = 0; i < itemColumns.length; ++i) {
    itemFragment += itemColumns[i].name[0].toLowerCase() + itemColumns[i].name.slice(1) + "\n";
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
            mysql.query(`${ mobSchema.selectSQL.mobSelectSQL } WHERE M.Id = ?`,
                [mobId],
                function(error, results, fields) {
                    if (error)
                        reject(error);

                    if (results.length > 0)
                        resolve(new mobSchema.classes.Mob(results[0]));
                    else
                        reject(Error(`Mob with id (${mobId}) not found.`));
                });
        });
    }

    getQuest() {
        if (!this.questId)
            return null;

        let questId = this.questId;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ questSchema.selectSQL.questSelectSQL } WHERE Id = ?`,
                [questId],
                function(error, results, fields) {
                    if (error)
                        reject(error);

                    if (results.length > 0)
                        resolve(new questSchema.classes.Quest(results[0]));
                    else
                        reject(Error(`Quest with id (${questId}) not found`));
                });
        });
    }

    getHistories() {
        if (!this.id)
            return [];

        let id = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ itemSelectSQL }, ItemId FROM Items_AuditTrail WHERE ItemId = ? ORDER BY ModifiedOn DESC`,
            [id],
                function(error, results, fields){
                    if (error) reject(error);

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
                    if (error) reject(error);

                    if (results.length > 0){
                        let response = [];
                        for (let i = 0; i < results.length; ++i) {
                            response.push(new ItemStatInfo(results[i]));
                        }
                        resolve(response);
                    }
                    else {
                        reject(Error(`ItemStatCategory with categoryId (${id}) not found.`));
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
                    if (error) reject(error);

                    if (results.length > 0)
                        resolve(new ItemStatCategory(results[0]));
                    else
                        reject(Error(`ItemStatCategory with id (${categoryId}) not found.`));
                });
        });
    }
}

let getItemById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } FROM Items WHERE Id = ?`,
            [id],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0)
                    resolve(new Item(results[0]));
                else
                    reject(Error(`Item with id (${id}) not found.`));
            });
    });
};

let getItemsInIds = function(ids) {
    if (ids.length === 0)
        return [];

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } FROM Items WHERE Id IN (?)`,
            [ids],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new Item(results[i]));
                    }
                    resolve(response);
                }
                else {
                    reject(Error(`Items with ids (${ids}) not found.`));
                }
            });
    });
};

let getItemHistoryById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL }, ItemId FROM Items_AuditTrail WHERE Id = ?`,
            [id],
            function(error, results, fields) {
                if (error) reject(error);

                if (results.length > 0){
                    var historyId = results[0].Id;
                    results[0].Id = results[0].ItemId;
                    resolve({id: historyId, item: new Item(results[0])});
                }
                else
                    reject(Error(`Item History with id (${id}) not found.`));
            });
    });
};

let getItemsBySlotId = function(slotId) {
    if (!slotId)
        return [];

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } FROM Items WHERE Slot = ? ORDER BY Name ASC`,
            [slotId],
            function(error, results, fields) {
                if (error)
                    reject(error);

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
                if (error) reject(error);

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
                if (error) reject(error);

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
    let noSearch = searchString === undefined && !filterString;
    if (searchString === undefined)
        searchString = "";
    if (sortBy === undefined)
        sortBy = noSearch ? "ModifiedOn" : "name";
    if (sortAsc === undefined)
        sortAsc = !noSearch;
    if (page === undefined)
        page = 1;
    if (rows === undefined)
        rows = 20;

    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Var, FilterString FROM ItemStatInfo`,
            function(error, results, fields) {
                if (error) reject(error);

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
                    let actualSortBy = "Name";
                    if (noSearch) {
                        actualSortBy = "ModifiedOn";
                    }
                    else {
                        for (let i = 0; i < results.length; ++i) {
                            if (results[i].Var.toLowerCase() === sortBy.toLowerCase())
                                actualSortBy = results[i].Var;
                        }
                    }

                    mysql.query(`${ itemSelectSQL } FROM Items WHERE (? = '' OR Name LIKE ?)${filterQuery} ORDER BY ${actualSortBy} ${sortAsc ? "ASC" : "DESC"} LIMIT ${(page - 1) * rows}, ${rows + 1}`,
                        [searchString, "%" + searchString + "%"],
                        function(error, results, fields) {
                            if (error) reject(error);

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
                    reject(Error(`ItemStatInfo not found.`));
                    return;
                }
            });
    });
};

let insertItem = function(args) {
    let ip = auth.utils.getIPFromRequest(args["req"])
    if (apiUtils.isIPBlocked(ip))
        return new graphql.GraphQLError("Too many attempts. Try again later.");

    let statValues = {};
    return new Promise(function(resolve, reject) {
        let authResponse = null;
        auth.utils.authToken(args["authToken"], ip).then(
            function(response) {
                authResponse = response;
            }
        ).catch(
            function(reason) {
                reject(reason);
            }
        );
        if (!authResponse)
            return;

        mysql.query(`SELECT Var, DefaultValue, Type FROM ItemStatInfo`,
            function(error, results, fields) {
                if (error) {
                    failed = true;
                    reject(error);
                    return;
                }

                if (results.length > 0) {
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
                        "NetStat",
                        "ModifiedBy",
                        "ModifiedOn",
                        "ModifiedByIP"
                    );
                    values.push(
                        0, // TODO: calculate netStat
                        authResponse.username,
                        new Date(),
                        ip
                    );

                    mysql.query(`INSERT INTO Items (??) VALUES (?)`,
                        [keys, values],
                        function(error, results, fields) {
                            apiUtils.trackPageUpdate(ip);
                            resolve({id: results.insertId, tokenRenewal: {token: authResponse.token, expires: authResponse.expires}});
                        });
                }
            });
    });
};

let updateItem = function(args) {
    let ip = auth.utils.getIPFromRequest(args["req"]);
    let statValues = {};
    return new Promise(function(resolve, reject) {
        let authResponse = null;
        auth.utils.authToken(args["authToken"], ip).then(
            function(response) {
                authResponse = response;
                username = response.username;
                newToken = response.token;
                newTokenExpires = response.expires;
            }
        ).catch(
            function(reason) {
                reject(reason);
            }
        );
        if (!authResponse)
            return;

        mysql.query(`SELECT Var, DefaultValue, Type FROM ItemStatInfo`,
            function(error, results, fields) {
                if (error) reject(error);

                if (results.length > 0) {
                    for (let i = 0; i < results.length; ++i) {
                        if (args[results[i].Var] !== undefined &&
                            args[results[i].Var] !== null) {
                            statValues[results[i].Var] = args[results[i].Var];
                        }
                    }

                    let sqlParts = ["UPDATE Items SET"];
                    let placeholders = [];
                    let placeholderValues = [];
                    for (let key in statValues) {
                        if (key !== "netStat" && key !== "id" && statValues.hasOwnProperty(key)) {
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
                        "?? = ?"
                    );
                    placeholderValues.push(
                        "NetStat",
                        0, // TODO: calculate netStat
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
                }
            });
    });
};

let itemType = new graphql.GraphQLObjectType({
    name: "Item",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)  },
        slot: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        strength: { type: graphql.GraphQLInt  },
        mind: { type: graphql.GraphQLInt  },
        dexterity: { type: graphql.GraphQLInt  },
        constitution: { type: graphql.GraphQLInt  },
        perception: { type: graphql.GraphQLInt  },
        spirit: { type: graphql.GraphQLInt  },
        ac: { type: graphql.GraphQLInt  },
        hit: { type: graphql.GraphQLInt  },
        dam: { type: graphql.GraphQLInt  },
        hp: { type: graphql.GraphQLInt  },
        hpr: { type: graphql.GraphQLInt  },
        ma: { type: graphql.GraphQLInt  },
        mar: { type: graphql.GraphQLInt  },
        mv: { type: graphql.GraphQLInt  },
        mvr: { type: graphql.GraphQLInt  },
        spelldam: { type: graphql.GraphQLInt  },
        spellcrit: { type: graphql.GraphQLInt  },
        manaReduction: { type: graphql.GraphQLInt  },
        mitigation: { type: graphql.GraphQLInt  },
        accuracy: { type: graphql.GraphQLInt  },
        ammo: { type: graphql.GraphQLInt  },
        twoHanded: { type: graphql.GraphQLBoolean  },
        quality: { type: graphql.GraphQLInt  },
        maxDam: { type: graphql.GraphQLInt  },
        avgDam: { type: graphql.GraphQLInt  },
        minDam: { type: graphql.GraphQLInt  },
        parry: { type: graphql.GraphQLInt  },
        holdable: { type: graphql.GraphQLBoolean  },
        rent: { type: graphql.GraphQLInt  },
        value: { type: graphql.GraphQLInt  },
        weight: { type: graphql.GraphQLFloat  },
        speedFactor: { type: graphql.GraphQLInt  },
        notes: { type: graphql.GraphQLString  },
        modifiedBy: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)  },
        modifiedOn: { type: new graphql.GraphQLNonNull(GraphQLDateTime)  },
        uniqueWear: { type: graphql.GraphQLBoolean  },
        modifiedByIP: { type: graphql.GraphQLString  },
        modifiedByIPForward: { type: graphql.GraphQLString  },
        alignRestriction: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        bonded: { type: graphql.GraphQLBoolean  },
        casts: { type: graphql.GraphQLString  },
        level: { type: graphql.GraphQLInt  },
        netStat: { type: graphql.GraphQLFloat  },
        concentration: { type: graphql.GraphQLInt  },
        rangedAccuracy: { type: graphql.GraphQLInt  },
        mobId: { type: graphql.GraphQLInt  },
        questId: { type: graphql.GraphQLInt  },
        weaponType: { type: graphql.GraphQLInt  },
        weaponStat: { type: graphql.GraphQLInt  },
        isLight: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)  },
        isHeroic: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)  },

        getMob: { type: mobSchema.types.mobType },
        getQuest: { type: questSchema.types.questType },
        getHistories: { type: new graphql.GraphQLList(itemHistoryType) }
    })
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

let idMutationResponseType = new graphql.GraphQLObjectType({
    name: "IdMutationResponse",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        tokenRenewal: { type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType) },
    })
});

let qFields = {
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

let mFields = {
    insertItem: {
        type: idMutationResponseType,
        args: {
            authToken: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            slot: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
            strength: { type: graphql.GraphQLInt },
            mind: { type: graphql.GraphQLInt },
            dexterity: { type: graphql.GraphQLInt },
            constitution: { type: graphql.GraphQLInt },
            perception: { type: graphql.GraphQLInt },
            spirit: { type: graphql.GraphQLInt },
            ac: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
            hit: { type: graphql.GraphQLInt },
            dam: { type: graphql.GraphQLInt },
            hp: { type: graphql.GraphQLInt },
            hpr: { type: graphql.GraphQLInt },
            ma: { type: graphql.GraphQLInt },
            mar: { type: graphql.GraphQLInt },
            mv: { type: graphql.GraphQLInt },
            mvr: { type: graphql.GraphQLInt },
            spelldam: { type: graphql.GraphQLInt },
            spellcrit: { type: graphql.GraphQLInt },
            manaReduction: { type: graphql.GraphQLInt },
            mitigation: { type: graphql.GraphQLInt },
            accuracy: { type: graphql.GraphQLInt },
            ammo: { type: graphql.GraphQLInt },
            twoHanded: { type: graphql.GraphQLBoolean },
            quality: { type: graphql.GraphQLInt },
            maxDam: { type: graphql.GraphQLInt },
            avgDam: { type: graphql.GraphQLInt },
            minDam: { type: graphql.GraphQLInt },
            parry: { type: graphql.GraphQLInt },
            holdable: { type: graphql.GraphQLBoolean },
            rent: { type: graphql.GraphQLInt },
            value: { type: graphql.GraphQLInt },
            weight: { type: new graphql.GraphQLNonNull(graphql.GraphQLFloat) },
            speedFactor: { type: graphql.GraphQLInt },
            notes: { type: graphql.GraphQLString },
            uniqueWear: { type: graphql.GraphQLBoolean },
            alignRestriction: { type: graphql.GraphQLInt },
            bonded: { type: graphql.GraphQLBoolean },
            casts: { type: graphql.GraphQLString },
            level: { type: graphql.GraphQLInt },
            netStat: { type: graphql.GraphQLFloat },
            concentration: { type: graphql.GraphQLInt },
            rangedAccuracy: { type: graphql.GraphQLInt },
            mobId: { type: graphql.GraphQLInt },
            questId: { type: graphql.GraphQLInt },
            weaponType: { type: graphql.GraphQLInt },
            weaponStat: { type: graphql.GraphQLInt },
            isLight: { type: graphql.GraphQLBoolean },
            isHeroic: { type: graphql.GraphQLBoolean }
        },
        resolve: function(_, {
            authToken,
            name,
            slot,
            strength,
            mind,
            dexterity,
            constitution,
            perception,
            spirit,
            ac,
            hit,
            dam,
            hp,
            hpr,
            ma,
            mar,
            mv,
            mvr,
            spelldam,
            spellcrit,
            manaReduction,
            mitigation,
            accuracy,
            ammo,
            twoHanded,
            quality,
            maxDam,
            avgDam,
            minDam,
            parry,
            holdable,
            rent,
            value,
            weight,
            speedFactor,
            notes,
            uniqueWear,
            alignRestriction,
            bonded,
            casts,
            level,
            netStat,
            concentration,
            rangedAccuracy,
            mobId,
            questId,
            weaponType,
            weaponStat,
            isLight,
            isHeroic
        }, req) {
            return insertItem({
                req,
                authToken,
                name,
                slot,
                strength,
                mind,
                dexterity,
                constitution,
                perception,
                spirit,
                ac,
                hit,
                dam,
                hp,
                hpr,
                ma,
                mar,
                mv,
                mvr,
                spelldam,
                spellcrit,
                manaReduction,
                mitigation,
                accuracy,
                ammo,
                twoHanded,
                quality,
                maxDam,
                avgDam,
                minDam,
                parry,
                holdable,
                rent,
                value,
                weight,
                speedFactor,
                notes,
                uniqueWear,
                alignRestriction,
                bonded,
                casts,
                level,
                netStat,
                concentration,
                rangedAccuracy,
                mobId,
                questId,
                weaponType,
                weaponStat,
                isLight,
                isHeroic
            });
        }
    },
    updateItem: {
        type: new graphql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
            name: { type: graphql.GraphQLString },
            slot: { type: graphql.GraphQLInt },
            strength: { type: graphql.GraphQLInt },
            mind: { type: graphql.GraphQLInt },
            dexterity: { type: graphql.GraphQLInt },
            constitution: { type: graphql.GraphQLInt },
            perception: { type: graphql.GraphQLInt },
            spirit: { type: graphql.GraphQLInt },
            ac: { type: graphql.GraphQLInt },
            hit: { type: graphql.GraphQLInt },
            dam: { type: graphql.GraphQLInt },
            hp: { type: graphql.GraphQLInt },
            hpr: { type: graphql.GraphQLInt },
            ma: { type: graphql.GraphQLInt },
            mar: { type: graphql.GraphQLInt },
            mv: { type: graphql.GraphQLInt },
            mvr: { type: graphql.GraphQLInt },
            spelldam: { type: graphql.GraphQLInt },
            spellcrit: { type: graphql.GraphQLInt },
            manaReduction: { type: graphql.GraphQLInt },
            mitigation: { type: graphql.GraphQLInt },
            accuracy: { type: graphql.GraphQLInt },
            ammo: { type: graphql.GraphQLInt },
            twoHanded: { type: graphql.GraphQLBoolean },
            quality: { type: graphql.GraphQLInt },
            maxDam: { type: graphql.GraphQLInt },
            avgDam: { type: graphql.GraphQLInt },
            minDam: { type: graphql.GraphQLInt },
            parry: { type: graphql.GraphQLInt },
            holdable: { type: graphql.GraphQLBoolean },
            rent: { type: graphql.GraphQLInt },
            value: { type: graphql.GraphQLInt },
            weight: { type: graphql.GraphQLFloat },
            speedFactor: { type: graphql.GraphQLInt },
            notes: { type: graphql.GraphQLString },
            uniqueWear: { type: graphql.GraphQLBoolean },
            alignRestriction: { type: graphql.GraphQLInt },
            bonded: { type: graphql.GraphQLBoolean },
            casts: { type: graphql.GraphQLString },
            level: { type: graphql.GraphQLInt },
            netStat: { type: graphql.GraphQLFloat },
            concentration: { type: graphql.GraphQLInt },
            rangedAccuracy: { type: graphql.GraphQLInt },
            mobId: { type: graphql.GraphQLInt },
            questId: { type: graphql.GraphQLInt },
            weaponType: { type: graphql.GraphQLInt },
            weaponStat: { type: graphql.GraphQLInt },
            isLight: { type: graphql.GraphQLBoolean },
            isHeroic: { type: graphql.GraphQLBoolean }
        },
        resolve: function(_, {
            authToken,
            id,
            name,
            slot,
            strength,
            mind,
            dexterity,
            constitution,
            perception,
            spirit,
            ac,
            hit,
            dam,
            hp,
            hpr,
            ma,
            mar,
            mv,
            mvr,
            spelldam,
            spellcrit,
            manaReduction,
            mitigation,
            accuracy,
            ammo,
            twoHanded,
            quality,
            maxDam,
            avgDam,
            minDam,
            parry,
            holdable,
            rent,
            value,
            weight,
            speedFactor,
            notes,
            uniqueWear,
            alignRestriction,
            bonded,
            casts,
            level,
            netStat,
            concentration,
            rangedAccuracy,
            mobId,
            questId,
            weaponType,
            weaponStat,
            isLight,
            isHeroic
        }, req) {
            return updateItem({
                req,
                authToken,
                id,
                name,
                slot,
                strength,
                mind,
                dexterity,
                constitution,
                perception,
                spirit,
                ac,
                hit,
                dam,
                hp,
                hpr,
                ma,
                mar,
                mv,
                mvr,
                spelldam,
                spellcrit,
                manaReduction,
                mitigation,
                accuracy,
                ammo,
                twoHanded,
                quality,
                maxDam,
                avgDam,
                minDam,
                parry,
                holdable,
                rent,
                value,
                weight,
                speedFactor,
                notes,
                uniqueWear,
                alignRestriction,
                bonded,
                casts,
                level,
                netStat,
                concentration,
                rangedAccuracy,
                mobId,
                questId,
                weaponType,
                weaponStat,
                isLight,
                isHeroic
            });
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
