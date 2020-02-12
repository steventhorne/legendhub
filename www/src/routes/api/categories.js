let mysql = require("./mysql-connection");
let gql = require("graphql");
let apiUtils = require("./utils");

class Category {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
        this.number = sqlResult.Number;
    }

    getSubcategories() {
        let categoryId = this.id;
        return new Promise(function(resolve, reject) {
            mysql.query("SELECT Id, CategoryId, Name FROM SubCategories WHERE CategoryId = ?",
                [categoryId],
                function(error, results, fields) {
                    if (error) {
                        reject(new gql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new Subcategory(results[i]));
                    }
                    resolve(response);
                });
        });
    }
}

class Subcategory {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.categoryId = sqlResult.CategoryId;
        this.name = sqlResult.Name;
    }

    getCategory() {
        let categoryId = this.categoryId;
        return new Promise(function(resolve, reject) {
            mysql.query("SELECT Id, Name, Number FROM Categories WHERE Id = ?",
                [categoryId],
                function(error, results, fields) {
                    if (error) {
                        reject(new gql.GraphQLError(error.sqlMessage));
                        return;
                    }

                    if (results.length > 0) {
                        resolve(new Category(results[0]));
                    }
                    else {
                        new apiUtils.NotFoundError("Era not found.")
                    }
                });
        });
    }
}

let getCategories = function() {
    return new Promise(function(resolve, reject) {
        mysql.query("SELECT Id, Name, Number FROM Categories ORDER BY Number ASC",
            [],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                let response = [];
                for (let i = 0; i < results.length; ++i)
                    response.push(new Category(results[i]));
                resolve(response);
            });
    });
};

let getSubcategories = function() {
    return new Promise(function(resolve, reject) {
        mysql.query("SELECT Id, CategoryId, Name FROM SubCategories",
            [],
            function(error, results, fields) {
                if (error) {
                    reject(new gql.GraphQLError(error.sqlMessage));
                    return;
                }

                let response = [];
                for (let i = 0; i < results.length; ++i)
                    response.push(new SubCategory(results[i]));
                resolve(response);
            });
    });
};

let categoryType = new gql.GraphQLObjectType({
    name: "Category",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
        number: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },

        getSubcategories: { type: new gql.GraphQLList(subcategoryType) }
    })
});

let subcategoryType = new gql.GraphQLObjectType({
    name: "Subcategory",
    fields: () => ({
        id: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        categoryId: { type: new gql.GraphQLNonNull(gql.GraphQLInt) },
        name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },

        getCategory: { type: new gql.GraphQLNonNull(categoryType) }
    })
});

let qFields = {
    getCategories: {
        type: new gql.GraphQLList(categoryType),
        resolve: function() {
            return getCategories();
        }
    },
    getSubcategories: {
        type: new gql.GraphQLList(subcategoryType),
        resolve: function() {
            return getSubcategories();
        }
    }
};

module.exports.queryFields = qFields;
