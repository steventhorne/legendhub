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
            ,M.Aggro
            FROM Mobs M
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
            mysql.query(`${ itemSchema.selectSQL.itemSelectSQL } WHERE MobId = ?`,
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
        mysql.query(`${mobSelectSQL} WHERE M.Id = ?`,
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

let qFields = {
    getMobById: {
        type: mobType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getMobById(id);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.types = { mobType };
module.exports.classes = { Mob };
module.exports.selectSQL = { mobSelectSQL };
