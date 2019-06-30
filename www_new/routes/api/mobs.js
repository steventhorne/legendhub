let mysql = require("./mysql-connection");
let graphql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");

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
            mysql.query(`${ itemSchema.selectSQL.itemSelectSQL } FROM Items WHERE MobId = ?`,
                [mobId],
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
}

let getMobById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${mobSelectSQL} ${mobSelectTables} WHERE M.Id = ?`,
            [id],
            function(error, results, fields) {
                if (error)
                    reject(error);

                console.log(results);

                if (results.length > 0)
                    resolve(new Mob(results[0]));
                else
                    reject(Error(`Mob with id (${id}) not found.`));
            });
    });
};

let getMobs = function(searchString, sortBy, sortAsc, page, rows) {
    let noSearch = searchString === undefined;
    if (searchString === undefined)
        searchString = "";
    if (sortBy === undefined)
        sortBy = noSearch ? "modifiedOn" : "name";
    if (sortAsc === undefined)
        sortAsc = !noSearch;
    if (page === undefined)
        page = 1;
    if (rows === undefined)
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

        mysql.query(`${mobSelectSQL} ${mobSelectTables} WHERE M.Name LIKE ? ORDER BY ?? ${sortAsc ? "ASC" : "DESC"} LIMIT ?, ?`,
            [`%${searchString}%`, actualSortBy, (page - 1) * rows, rows + 1],
            function(error, results, fields) {
                if (error) {
                    reject(new graphql.GraphQLError(error));
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

        getItems: { type: new graphql.GraphQLList(itemSchema.types.itemType) }
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
            sortBy: { type: graphql.GraphQLString },
            sortAsc: { type: graphql.GraphQLBoolean },
            page: { type: graphql.GraphQLInt },
            rows: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {searchString, sortBy, sortAsc, page, rows}) {
            return getMobs(searchString, sortBy, sortAsc, page, rows);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.types = { mobType };
module.exports.classes = { Mob };
module.exports.selectSQL = { mobSelectSQL, mobSelectTables };
