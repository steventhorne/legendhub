let mysql = require("./mysql-connection");
let gql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

let wikiPageSelectSQL = `SELECT W.Id
    ,W.Title
    ,W.PinnedRecent
    ,W.PinnedSearch
    ,W.Locked
    ,W.CategoryId
    ,C.Name as CategoryName
    ,SubCategoryId
    ,SC.Name as SubCategoryName
    ,W.Tags
    ,W.Content
    ,ModifiedOn
    ,ModifiedBy
    ,ModifiedByIP
    ,ModifiedByIPForward`;
let wikiPageSelectTables = `FROM WikiPages W
    LEFT JOIN Categories C ON C.Id = W.CategoryId
    LEFT JOIN SubCategories SC ON SC.Id = W.SubCategoryId`;
let wikiPageHistorySelectTables = `FROM WikiPages_AuditTrail W
    LEFT JOIN Categories C ON C.Id = W.CategoryId
    LEFT JOIN SubCategories SC ON SC.Id = W.SubCategoryId`;

class WikiPage {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.title = sqlResult.Title;
        this.pinnedRecent = sqlResult.PinnedRecent;
        this.pinnedSearch = sqlResult.PinnedSearch;
        this.locked = sqlResult.Locked;
        this.categoryId = sqlResult.CategoryId;
        this.categoryName = sqlResult.CategoryName;
        this.subcategoryId = sqlResult.SubCategoryId;
        this.subcategoryName = sqlResult.SubCategoryName;
        this.tags = sqlResult.Tags;
        this.content = sqlResult.Content;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedByIP = sqlResult.ModifiedByIP;
        this.modifiedByIPForward = sqlResult.ModifiedByIPForward;
    }

    getHistories() {
        if (!this.id)
            return [];

        let id = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query(`${wikiPageSelectSQL}, WikiPageId ${wikiPageHistorySelectTables} WHERE WikiPageId = ? ORDER BY ModifiedOn DESC`,
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
                            results[i].Id = results[i].WikiPageId;
                            response.push({id: historyId, wikiPage: new WikiPage(results[i])});
                        }
                        resolve(response);
                    }
                    else
                        resolve([]);
                });
        });
    }
}

let getWikiPageById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${wikiPageSelectSQL} ${wikiPageSelectTables} WHERE W.Id = ?`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0)
                    resolve(new WikiPage(results[0]));
                else
                    reject(new apiUtils.NotFoundError(`WikiPage with id, ${id}, not found.`));
            });
    });
};

let getWikiPages = function(searchString, categoryId, subcategoryId, sortBy, sortAsc, page, rows) {
    let noSearch = searchString == null && categoryId == null && subcategoryId == null;
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
            actualSortBy = "W." + sortBy[0].toUpperCase() + sortBy.slice(1);
        else if (sortBy === "categoryName")
            actualSortBy = "C.Name";
        else if (sortBy === "subcategoryName")
            actualSortBy = "SC.Name";

        let likeSearchString = `%${searchString}%`;
        let sql = [wikiPageSelectSQL, wikiPageSelectTables, "WHERE (W.Title LIKE ? OR W.Tags LIKE ? OR Content LIKE ?)"];
        let placeholders = [likeSearchString, likeSearchString, likeSearchString];
        if (categoryId) {
            sql.push("AND W.CategoryId = ?");
            placeholders.push(categoryId);
        }
        if (subcategoryId) {
            sql.push("AND W.SubCategoryId = ?");
            placeholders.push(subcategoryId);
        }
        sql.push(`ORDER BY ?? DESC,
        CASE
            WHEN Title LIKE ? THEN 1
            WHEN Tags LIKE ? THEN 2
            WHEN Content LIKE ? THEN 3
            ELSE 4
        END ASC,
        ?? ${sortAsc ? "ASC" : "DESC"} LIMIT ?, ?`);
        placeholders.push(
            noSearch ? "PinnedRecent" : "PinnedSearch",
            likeSearchString,
            likeSearchString,
            likeSearchString,
            actualSortBy,
            (page - 1) * rows, rows + 1
        );

        mysql.query(sql.join(" "), placeholders,
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < Math.min(results.length, rows); ++i) {
                        response.push(new WikiPage(results[i]));
                    }
                    resolve({moreResults: results.length > rows, wikiPages: response});
                }
                else {
                    resolve({moreResults: false, wikiPages: []});
                }
            });
    });
};

let getWikiPageHistoryById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${wikiPageSelectSQL}, WikiPageId ${wikiPageHistorySelectTables} WHERE W.Id = ?`,
            [id],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                if (results.length > 0) {
                    let historyId = results[0].Id;
                    results[0].Id = results[0].WikiPageId;
                    resolve({id: historyId, wikiPage: new WikiPage(results[0])});
                }
                else
                    reject(new apiUtils.NotFoundError(`Wiki History with id, ${id}, not found.`));
            });
    });
};

let insertWikiPage = function (req, authToken, title, categoryId, subcategoryId, tags, content) {
    if (categoryId == null)
        categoryId = 0;
    if (subcategoryId == null)
        subcategoryId = 0;
    if (tags == null)
        tags = "";
    if (content == null)
        content = "";

    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("INSERT INTO WikiPages(Title, CategoryId, SubCategoryId, Tags, Content, ModifiedOn, ModifiedBy, ModifiedByIP) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)",
                    [title, categoryId, subcategoryId, tags, content, response.username, response.ip],
                    function(error, results, fields) {
                        if (error) {
                            reject(new gql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        apiUtils.trackPageUpdate(response.ip);
                        resolve({id: results.insertId, tokenRenewal: {token: response.token, expires: response.expires}});
                    });
            }
        ).catch(error => reject(error));
    });
};

let updateWikiPage = function(req, authToken, id, title, categoryId, subcategoryId, tags, content) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                let sql = ["UPDATE WikiPages SET"];
                let placeholders = [];
                if (title != null) {
                    sql.push("Title = ?,");
                    placeholders.push(title);
                }
                if (categoryId != null) {
                    sql.push("CategoryId = ?,");
                    placeholders.push(categoryId);
                }
                if (subcategoryId != null) {
                    sql.push("SubCategoryId = ?,");
                    placeholders.push(subcategoryId);
                }
                if (tags != null) {
                    sql.push("Tags = ?,");
                    placeholders.push(tags);
                }
                if (content != null) {
                    sql.push("Content = ?,");
                    placeholders.push(content);
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
        ).catch(error => reject(error));
    });
};

let revertWikiPage = function(req, authToken, historyId) {
    return new Promise(function(resolve, reject) {
        auth.utils.authMutation(req, authToken).then(
            function(response) {
                mysql.query("SELECT WikiPageId, Title, CategoryId, SubCategoryId, Tags, Content FROM WikiPages_AuditTrail WHERE Id = ?",
                    [historyId],
                    function(error, results, fields) {
                        if (error) {
                            reject(new gql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        if (results.length == 0) {
                            reject(new apiUtils.NotFoundError(`Wiki History with id, ${historyId}, not found.`));
                            return;
                        }

                        let sql = [
                            "UPDATE WikiPages SET",
                            "Title = ?,",
                            "CategoryId = ?,",
                            "SubCategoryId = ?,",
                            "Tags = ?,",
                            "Content = ?,",
                            "ModifiedOn = NOW(),",
                            "ModifiedBy = ?,",
                            "ModifiedByIP = ?",
                            "WHERE Id = ?"
                        ];
                        mysql.query(sql.join(" "),
                            [results[0].Title, results[0].CategoryId, results[0].SubCategoryId, results[0].Tags, results[0].Content, response.username, response.ip, results[0].WikiPageId],
                            function(error, revertResults, fields) {
                                if (error) {
                                    reject(new gql.GraphQLError(error.sqlMessage));
                                    return;
                                }

                                apiUtils.trackPageUpdate(response.ip);
                                resolve({id: results[0].WikiPageId, tokenRenewal: {token: response.token, expires: response.expires}});
                            });
                    });
            }
        ).catch(error => reject(error));
    });
};

let wikiPageType = new gql.GraphQLObjectType({
    name: "WikiPage",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        title: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        pinnedRecent: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
        pinnedSearch: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
        locked: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
        categoryId: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        categoryName: { type: gql.GraphQLString },
        subcategoryId: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        subcategoryName: { type: gql.GraphQLString },
        tags: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        content: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        modifiedOn: { type: new gql.GraphQLNonNull(GraphQLDateTime) },
        modifiedBy: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        modifiedByIP: { type: gql.GraphQLString },
        modifiedByIPForward: { type: gql.GraphQLString },
        getHistories: { type: new gql.GraphQLList(wikiPageHistoryType) }
    })
});

let wikiPageHistoryType = new gql.GraphQLObjectType({
    name: "WikiPageHistory",
    fields: () => ({
        id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        wikiPage: {type: wikiPageType}
    })
});

let wikiPageSearchResultsType = new gql.GraphQLObjectType({
    name: "WikiPageSearchResult",
    fields: () => ({
        moreResults: {type: gql.GraphQLBoolean},
        wikiPages: {type: new gql.GraphQLList(wikiPageType)}
    })
});

let qFields = {
    getWikiPageById: {
        type: wikiPageType,
        args: {
            id: { type: gql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getWikiPageById(id);
        }
    },
    getWikiPages: {
        type: wikiPageSearchResultsType,
        args: {
            searchString: {type: gql.GraphQLString},
            categoryId: {type: gql.GraphQLInt},
            subcategoryId: {type: gql.GraphQLInt},
            sortBy: {type: gql.GraphQLString},
            sortAsc: {type: gql.GraphQLBoolean},
            page: {type: gql.GraphQLInt},
            rows: {type: gql.GraphQLInt}
        },
        resolve: function(_, {searchString, categoryId, subcategoryId, sortBy, sortAsc, page, rows}) {
            return getWikiPages(searchString, categoryId, subcategoryId, sortBy, sortAsc, page, rows);
        }
    },
    getWikiPageHistoryById: {
        type: wikiPageHistoryType,
        args: {
            id: {type: gql.GraphQLInt}
        },
        resolve: function(_, {id}) {
            return getWikiPageHistoryById(id);
        }
    }
};

let mFields = {
    insertWikiPage: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            title: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            categoryId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
            subcategoryId: {type: gql.GraphQLInt},
            tags: {type: gql.GraphQLString},
            content: {type: gql.GraphQLString}
        },
        resolve: function(_, {
            authToken,
            title,
            categoryId,
            subcategoryId,
            tags,
            content
        }, req) {
            return insertWikiPage(
                req,
                authToken,
                title,
                categoryId,
                subcategoryId,
                tags,
                content
            );
        }
    },
    updateWikiPage: {
        type: new gql.GraphQLNonNull(auth.types.tokenRenewalType),
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
            title: {type: gql.GraphQLString},
            categoryId: {type: gql.GraphQLInt},
            subcategoryId: {type: gql.GraphQLInt},
            tags: {type: gql.GraphQLString},
            content: {type: gql.GraphQLString}
        },
        resolve: function(_, {
            authToken,
            id,
            title,
            categoryId,
            subcategoryId,
            tags,
            content
        }, req) {
            return updateWikiPage(req, authToken, id, title, categoryId, subcategoryId, tags, content);
        }
    },
    revertWikiPage: {
        type: auth.types.idMutationResponseType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            historyId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)}
        },
        resolve: function(_, {authToken, historyId}, req) {
            return revertWikiPage(req, authToken, historyId);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
module.exports.types = { wikiPageType };
module.exports.classes = { WikiPage };
module.exports.selectSQL = { wikiPageSelectSQL, wikiPageSelectTables };
