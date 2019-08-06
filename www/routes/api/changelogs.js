let mysql = require("./mysql-connection");
let gql = require("graphql");
let {GraphQLDateTime} = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

let changelogSelectSQL = `SELECT Id
    ,Version
    ,Notes
    ,CreatedOn
    ,ModifiedOn
    ,ModifiedBy
    ,ModifiedByIP
    FROM ChangelogVersions`;

class Changelog {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.version = sqlResult.Version;
        this.notes = sqlResult.Notes;
        this.createdOn = sqlResult.CreatedOn;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedByIP = sqlResult.ModifiedByIP;
    }
};

let getChangelogById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${changelogSelectSQL} WHERE Id = ?`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0)
                    resolve(new Changelog(results[0]));
                else
                    reject(new apiUtils.NotFoundError(`Changelog with id, ${id}, not found.`));
            });
    });
};

let getChangelogs = function(page, rows) {
    if (page == null)
        page = 1;
    if (rows == null)
        rows = 20;

    return new Promise(function(resolve, reject) {
        mysql.query(`${changelogSelectSQL} ORDER BY CreatedOn DESC LIMIT ?, ?`,
            [(page - 1) * rows, rows + 1],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < Math.min(results.length, rows); ++i) {
                        response.push(new Changelog(results[i]));
                    }
                    resolve({moreResults: results.length > rows, changelogs: response});
                }
                else {
                    resolve({moreResults: false, changelogs: []});
                }
            });
    });
};

let insertChangelog = function(req, authToken, version, notes) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken, true).then(
            function(response) {
                if (response.permissions.hasOwnProperty("ChangelogVersion") &&
                    response.permissions["ChangelogVersion"].create) {
                    mysql.query("INSERT INTO ChangelogVersions(Version, Notes, CreatedOn, ModifiedOn, ModifiedBy, ModifiedByIP) VALUES (?, ?, NOW(), NOW(), ?, ?)",
                        [version, notes, response.username, response.ip],
                        function(error, results, fields) {
                            if (error) {
                                reject(new gql.GraphQLError(error.sqlMessage));
                                return;
                            }

                            apiUtils.trackPageUpdate(response.ip);
                            resolve({id: results.insertId, tokenRenewal: {token: response.token, expires: response.expires}});
                        });
                }
                else {
                    reject(apiUtils.UnauthorizedError());
                }
            }
        ).catch(error => reject(error));
    });
};

let updateChangelog = function(req, authToken, id, version, notes) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken, true).then(
            function(response) {
                if (response.permissions.hasOwnProperty("ChangelogVersion") &&
                    response.permissions["ChangelogVersion"].update) {
                    mysql.query("UPDATE ChangelogVersions SET Version = ?, Notes = ?, ModifiedOn = NOW(), ModifiedBy = ?, ModifiedByIP = ? WHERE Id = ?",
                        [version, notes, response.username, response.ip, id],
                        function(error, results, fields) {
                            if (error) {
                                reject(new gql.GraphQLError(error.sqlMessage));
                                return;
                            }

                            apiUtils.trackPageUpdate(response.ip);
                            resolve({token: response.token, expires: response.expires});
                        });
                }
                else {
                    reject(apiUtils.UnauthorizedError());
                }
            }
        ).catch(error => reject(error));
    });
};

let changelogType = new gql.GraphQLObjectType({
    name: "Changelog",
    fields: () => ({
        id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        version: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        notes: {type: gql.GraphQLString},
        createdOn: {type: new gql.GraphQLNonNull(GraphQLDateTime)},
        modifiedOn: {type: new gql.GraphQLNonNull(GraphQLDateTime)},
        modifiedBy: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        modifiedByIP: {type: gql.GraphQLString}
    })
});

let changelogSearchResultsType = new gql.GraphQLObjectType({
    name: "ChangelogSearchResult",
    fields: () => ({
        moreResults: {type: gql.GraphQLBoolean},
        changelogs: {type: new gql.GraphQLList(changelogType)}
    })
});

let qFields = {
    getChangelogById: {
        type: changelogType,
        args: {
            id: {type: gql.GraphQLInt}
        },
        resolve: function(_, {id}) {
            return getChangelogById(id);
        }
    },
    getChangelogs: {
        type: changelogSearchResultsType,
        args: {
            page: {type: gql.GraphQLInt},
            rows: {type: gql.GraphQLInt}
        },
        resolve: function(_, {page, rows}) {
            return getChangelogs(page, rows);
        }
    }
};

let mFields = {
    insertChangelog: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            version: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            notes: {type: new gql.GraphQLNonNull(gql.GraphQLString)}
        },
        resolve: function(_, {
            authToken,
            version,
            notes
        }, req) {
            return insertChangelog(
                req,
                authToken,
                version,
                notes
            );
        }
    },
    updateChangelog: {
        type: new gql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
            version: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            notes: {type: new gql.GraphQLNonNull(gql.GraphQLString)}
        },
        resolve: function(_, {
            authToken,
            id,
            version,
            notes
        }, req) {
            return updateChangelog(req, authToken, version, notes);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
