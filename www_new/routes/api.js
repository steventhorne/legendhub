let exgraphql = require("express-graphql");
let graphql = require("graphql");

let importGraphs = [
    require("./api/auth.js"),
    require("./api/items.js"),
    require("./api/mobs.js"),
    require("./api/quests.js"),
    require("./api/wikiPages.js"),
    require("./api/areas.js"),
    require("./api/categories.js"),
    require("./api/changelogs.js")
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

let mutationType = new graphql.GraphQLObjectType({
    name: "Mutation",
    fields: mutationFields
});


let schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType
});

let limitMutationRule = function(context) {
    return {
        OperationDefinition(node) {
            if (node.operation === "mutation") {
                if (!context.mutationCount)
                    context.mutationCount = node.selectionSet.selections.length;
                else
                    context.mutationCount += node.selectionSet.selections.length;

                if (context.mutationCount > 1) {
                    context.reportError(new graphql.GraphQLError("Multiple mutation operations are not allowed."));
                }
            }
        }
    }
};

let errorFormatFn = function(error) {
    let errorCode = 500;
    if (error.extensions && error.extensions.code)
        errorCode = error.extensions.code;

    return ({
        message:error.message,
        path:error.path,
        code:errorCode
    });
};

module.exports = exgraphql({
    schema: schema,
    rootValue: root,
    graphiql: true,
    validationRules: [limitMutationRule],
    customFormatErrorFn: errorFormatFn
});
