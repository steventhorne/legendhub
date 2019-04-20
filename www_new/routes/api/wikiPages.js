let mysql = require("./mysql-connection");
let gql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");


let wikiPageSelectSQL = `SELECT W.Id
    ,Title
    ,PinnedRecent
    ,PinnedSearch
    ,Locked
    ,CategoryId
    ,SubCategoryId
    ,Tags
    ,Content
    ,ModifiedOn
    ,ModifiedBy
    ,ModifiedByIP
    ,ModifiedByIPForward
    FROM WikiPages W`;

class WikiPage {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.title = sqlResult.Title;
        this.pinnedRecent = sqlResult.PinnedRecent;
        this.pinnedSearch = sqlResult.PinnedSearch;
        this.locked = sqlResult.Locked;
        this.categoryId = sqlResult.CategoryId;
        this.subCategoryId = sqlResult.SubCategoryId;
        this.tags = sqlResult.Tags;
        this.content = sqlResult.Content;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedByIP = sqlResult.ModifiedByIP;
        this.modifiedByIPForward = sqlResult.ModifiedByIPForward;
    }
};

let getWikiPageById = function(id) {
    return new Promise(function(resolve, reject) {
        mysql.query(`${ wikiPageSelectSQL } WHERE W.Id = ?`,
            [id],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0)
                    resolve(new WikiPage(results[0]));
                else
                    reject(Error(`WikiPage with id (${id}) not found.`));
            });
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
        subCategoryId: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        tags: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        content: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        modifiedOn: { type: new gql.GraphQLNonNull(GraphQLDateTime) },
        modifiedBy: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        modifiedByIP: { type: gql.GraphQLString },
        modifiedByIPForward: { type: gql.GraphQLString }
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
    }
};

module.exports.queryFields = qFields;
module.exports.types = { wikiPageType };
module.exports.classes = { WikiPage };
module.exports.selectSQL = { wikiPageSelectSQL };
