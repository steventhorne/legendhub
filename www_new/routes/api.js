let exgraphql = require("express-graphql");
let graphql = require("graphql");

let importGraphs = [
    require("./api/items.js"),
    require("./api/mobs.js"),
    require("./api/quests.js"),
    require("./api/wikiPages.js")
];

var queryFields = {};
var mutationFields = {};

for (let i = 0; i < importGraphs.length; ++i) {
    if (importGraphs[i].queryFields) {
        for (let key in importGraphs[i].queryFields) {
            if (importGraphs[i].queryFields.hasOwnProperty(key))
                queryFields[key] = importGraphs[i].queryFields[key];
        }
    }

    if (importGraphs[i].mutationFields) {
        for (let key in importGraphs[i].mutationFields) {
            if (importGraphs[i].mutationFields.hasOwnProperty(key))
                mutationFields[key] = importGraphs[i].mutationFields[key];
        }
    }
}

let queryType = new graphql.GraphQLObjectType({
    name: "Query",
    fields: queryFields
});


let schema = new graphql.GraphQLSchema({
    query: queryType
    // mutation: mutationType
});

module.exports = exgraphql({
    schema: schema,
    rootValue: root,
    graphiql: true,
});
