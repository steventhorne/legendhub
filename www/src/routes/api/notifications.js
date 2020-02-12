let mysql = require("./mysql-connection");
let gql = require("graphql");
let {GraphQLDateTime} = require("graphql-iso-date");
let auth = require("./auth");
let apiUtils = require("./utils");

class Notification {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.memberId = sqlResult.MemberId;
        this.actorName = sqlResult.ActorName;
        this.read = sqlResult.Read;
        this.objectType = sqlResult.ObjectType;
        this.objectId = sqlResult.ObjectId;
        this.objectPage = sqlResult.ObjectPage;
        this.objectName = sqlResult.ObjectName;
        this.verb = sqlResult.Verb;
        this.count = sqlResult.Count;
        this.createdOn = sqlResult.CreatedOn;
        this.message = `${this.objectType[0].toUpperCase()}${this.objectType.slice(1)} <span class="text-info">${this.objectName}</span> has been ${this.verb} `;
        if (this.count > 1)
            this.message += `${this.count} times.`;
        else
            this.message += `by ${this.actorName}.`;

        if (this.objectPage && this.objectId)
            this.link = `/${this.objectPage}/details.html?id=${this.objectId}`;
        else
            this.link = "";
    }
};

let getNotifications = function(req, authToken, read, page, rows) {
    if (page == null)
        page = 1;
    if (rows == null)
        rows = 20;

    return new Promise(function(resolve, reject) {
        auth.utils.authQuery(req, authToken, false).then(
            response => {
                let placeholders = [response.memberId];
                if (read != null)
                    placeholders.push(read);
                placeholders.push((page - 1) * rows, rows + 1);
                mysql.query(`SELECT N.Id
                    ,N.MemberId
                    ,MAX(NCM.Username) AS ActorName
                    ,N.Read
                    ,NC.ObjectType
                    ,NC.ObjectId
                    ,NC.ObjectPage
                    ,NC.ObjectName
                    ,NC.Verb
                    ,COUNT(1) AS Count
                    ,MAX(NC.CreatedOn) AS CreatedOn
                    FROM Notifications N
                    JOIN NotificationChanges NC ON NC.Id = N.NotificationChangeId AND NC.ActorId <> N.MemberId
                    JOIN Members NCM ON NC.ActorId = NCM.Id
                    WHERE N.MemberId = ?${read == null ? "":" AND N.Read = ?"}
                    GROUP BY N.MemberId, N.Read, NC.ObjectId, NC.ObjectType, NC.ObjectPage, NC.ObjectName, NC.Verb
                    ORDER BY MAX(NC.CreatedOn) DESC
                    LIMIT ?, ?`,
                    placeholders,
                        function(error, results, fields) {
                            if (error) {
                                reject(new gql.GraphQLError(error.sqlMessage));
                                return;
                            }

                            let response = [];
                            for (let i = 0; i < Math.min(results.length, rows); ++i) {
                                response.push(new Notification(results[i]));
                            }
                            resolve({moreResults: results.length > rows, results: response});
                    });
            }
        ).catch(error => reject(error));
    });
};

let markNotificationAsRead = function(req, authToken, objectType, objectId) {
    return new Promise(function(resolve, reject) {
        auth.utils.authQuery(req, authToken, false).then(
            response => {
                let sql = `UPDATE Notifications N
                JOIN NotificationChanges NC ON NC.Id = N.NotificationChangeId
                SET N.Read = 1 WHERE N.MemberId = ?`;
                let placeholders = [response.memberId];
                if (objectType && objectId) {
                    sql += " AND NC.ObjectType = ? AND NC.ObjectId = ?";
                    placeholders.push(objectType, objectId);
                }

                mysql.query(sql,
                    placeholders,
                    function(error, results, fields) {
                        if (error) {
                            reject(new gql.GraphQLError(error.sqlMessage));
                            return;
                        }

                        resolve(true);
                    });
            }
        ).catch(error => reject(error));
    });
};

let notificationType = new gql.GraphQLObjectType({
    name: "Notification",
    fields: () => ({
        id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        memberId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        actorName: {type: gql.GraphQLString},
        read: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        objectType: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        objectId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        objectPage: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        objectName: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        verb: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
        count: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        createdOn: {type: new gql.GraphQLNonNull(GraphQLDateTime)},
        message: {type: gql.GraphQLString},
        link: {type: gql.GraphQLString}
    })
});

let notificationResultsType = new gql.GraphQLObjectType({
    name: "NotificationResults",
    fields: () => ({
        moreResults: {type: gql.GraphQLBoolean},
        results: {type: new gql.GraphQLList(notificationType)}
    })
});

let qFields = {
    getNotifications: {
        type: notificationResultsType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            read: {type: gql.GraphQLBoolean},
            page: {type: gql.GraphQLInt},
            rows: {type: gql.GraphQLInt}
        },
        resolve: function(_, {authToken, read, page, rows}, req) {
            return getNotifications(req, authToken, read, page, rows);
        }
    }
};

let mFields = {
    markNotificationAsRead: {
        type: new gql.GraphQLNonNull(gql.GraphQLBoolean),
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)},
            objectType: {type: gql.GraphQLString},
            objectId: {type: gql.GraphQLInt}
        },
        resolve: function(_, {
            authToken,
            objectType,
            objectId
        }, req) {
            return markNotificationAsRead(req, authToken, objectType, objectId);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.mutationFields = mFields;
