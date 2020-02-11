let mysql = require("./mysql-connection");
let gql = require("graphql");
let apiUtils = require("./utils");

class Area {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
        this.eraId = sqlResult.EraId;
        this.eraName = sqlResult.EraName;
    }

    getEra() {
        let areaId = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query("SELECT E.Id, E.Name FROM Areas A JOIN Eras E ON E.Id = A.EraId WHERE A.Id = ?",
                [areaId],
                function(error, results, fields) {
                    if (error) {
                        reject(new gql.GraphQLError(error));
                        return;
                    }

                    if (results.length > 0) {
                        resolve(new Era(results[0]));
                    }
                    else {
                        reject(new apiUtils.NotFoundError("Era not found."));
                    }
                });
        });
    }
}

class Era {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
    }

    getAreas() {
        let eraId = this.id;
        let eraName = this.name;
        return new Promise(function(resolve, reject) {
            mysql.query("SELECT A.Id, A.Name, A.EraId, E.Name AS EraName FROM Eras E JOIN Areas A ON A.EraId = E.Id WHERE E.Id = ? ORDER BY A.Name ASC",
                [eraId],
                function(error, results, fields) {
                    if (error) {
                        reject(new gql.GraphQLError(error));
                        return;
                    }

                    let areas = [];
                    for (let i = 0; i < results.length; ++i)
                        areas.push(new Area(results[i]));
                    resolve(areas);
                })
        })
    }
}

let getAreas = function() {
    return new Promise(function(resolve, reject) {
        mysql.query("SELECT A.Id, A.Name, A.EraId, E.Name AS EraName FROM Areas A JOIN Eras E ON E.Id = A.EraId ORDER BY E.Id, A.Name ASC",
            [],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error));
                    return;
                }

                let areas = [];
                for (let i = 0; i < results.length; ++i)
                    areas.push(new Area(results[i]));
                resolve(areas);
            });
    });
};

let getEras = function() {
    return new Promise(function(resolve, reject) {
        mysql.query("SELECT Id, Name FROM Eras",
            [],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error));
                    return;
                }

                let eras = [];
                for (let i = 0; i < results.length; ++i)
                    eras.push(new Era(results[i]));
                resolve(eras);
            });
    });
};

let areaType = new gql.GraphQLObjectType({
    name: "Area",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        eraId: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        eraName: {type: new gql.GraphQLNonNull(gql.GraphQLString)},

        getEra: { type: new gql.GraphQLNonNull(eraType) }
    })
});

let eraType = new gql.GraphQLObjectType({
    name: "Era",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },

        getAreas: { type: new gql.GraphQLList(areaType) }
    })
});

let qFields = {
    getAreas: {
        type: new gql.GraphQLList(areaType),
        resolve: function() {
            return getAreas();
        }
    },
    getEras: {
        type: new gql.GraphQLList(eraType),
        resolve: function() {
            return getEras();
        }
    }
};

module.exports.queryFields = qFields;
