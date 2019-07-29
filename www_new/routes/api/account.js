let mysql = require("./mysql-connection");
let gql = require("graphql");
let apiUtils = require("./utils");
let auth = require("./auth")

class NotificationSetting {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.memberId = sqlResult.MemberId;
        this.itemAdded = sqlResult.ItemAdded;
        this.itemUpdated = sqlResult.ItemUpdated;
        this.mobAdded = sqlResult.MobAdded;
        this.mobUpdated = sqlResult.MobUpdated;
        this.questAdded = sqlResult.QuestAdded;
        this.questUpdated = sqlResult.QuestUpdated;
        this.wikiPageAdded = sqlResult.WikiPageAdded;
        this.wikiPageUpdated = sqlResult.WikiPageUpdated;
        this.changelogAdded = sqlResult.ChangelogAdded;
    }
}

let getNotificationSettings = function(req, authToken) {
    return new Promise(function(resolve, reject) {
        auth.utils.authQuery(req, authToken, false).then(
            response => {
                mysql.query("SELECT Id, MemberId, ItemAdded, ItemUpdated, MobAdded, MobUpdated, QuestAdded, QuestUpdated, WikiPageAdded, WikiPageUpdated, ChangelogAdded FROM NotificationSettings WHERE MemberId = ?",
                    [response.memberId],
                    function(error, results, fields) {
                        if (error) {
                            return reject(new gql.GraphQLError(error.sqlMessage));
                        }

                        if (results.length > 0) {
                            resolve(new NotificationSetting(results[0]));
                        }
                        else {
                            reject(apiUtils.NotFoundError("Notification settings not found for user."));
                        }
                    });
            }
        ).catch(error => reject(error));
    });
};

let notificationSettingType = new gql.GraphQLObjectType({
    name: "NotificationSetting",
    fields: () => ({
        id: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        memberId: {type: new gql.GraphQLNonNull(gql.GraphQLInt)},
        itemAdded: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        itemUpdated: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        mobAdded: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        mobUpdated: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        questAdded: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        questUpdated: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        wikiPageAdded: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        wikiPageUpdated: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)},
        changelogAdded: {type: new gql.GraphQLNonNull(gql.GraphQLBoolean)}
    })
});

let qFields = {
    getNotificationSettings: {
        type: notificationSettingType,
        args: {
            authToken: {type: new gql.GraphQLNonNull(gql.GraphQLString)}
        },
        resolve: function(_, {authToken}, req) {
            return getNotificationSettings(req, authToken);
        }
    }
};

module.exports.queryFields = qFields;
