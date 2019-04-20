let mysql = require("./mysql-connection");
let graphql = require("graphql");
let { GraphQLDateTime } = require("graphql-iso-date");

// required api schemas
let mobSchema = require("./mobs.js");
let questSchema = require("./quests.js");

let itemSelectSQL = `SELECT Id
    ,Name
    ,Slot
    ,Strength
    ,Mind
    ,Dexterity
    ,Constitution
    ,Perception
    ,Spirit
    ,Ac
    ,Hit
    ,Dam
    ,Hp
    ,Hpr
    ,Ma
    ,Mar
    ,Mv
    ,Mvr
    ,Spelldam
    ,Spellcrit
    ,ManaReduction
    ,Mitigation
    ,Accuracy
    ,Ammo
    ,TwoHanded
    ,Quality
    ,MaxDam
    ,AvgDam
    ,MinDam
    ,Parry
    ,Holdable
    ,Rent
    ,Value
    ,Weight
    ,SpeedFactor
    ,Notes
    ,ModifiedBy
    ,ModifiedOn
    ,UniqueWear
    ,ModifiedByIP
    ,ModifiedByIPForward
    ,AlignRestriction
    ,Bonded
    ,Casts
    ,Level
    ,NetStat
    ,Concentration
    ,RangedAccuracy
    ,MobId
    ,QuestId
    ,WeaponType
    ,WeaponStat
    ,IsLight
    ,IsHeroic
    FROM Items`;

class Item {
    constructor(sqlResult) {
        this.id = sqlResult.Id;
        this.name = sqlResult.Name;
        this.slot = sqlResult.Slot;
        this.strength = sqlResult.Strength;
        this.mind = sqlResult.Mind;
        this.dexterity = sqlResult.Dexterity;
        this.constitution = sqlResult.Constitution;
        this.perception = sqlResult.Perception;
        this.spirit = sqlResult.Spirit;
        this.ac = sqlResult.Ac;
        this.hit = sqlResult.Hit;
        this.dam = sqlResult.Dam;
        this.hp = sqlResult.Hp;
        this.hpr = sqlResult.Hpr;
        this.ma = sqlResult.Ma;
        this.mar = sqlResult.Mar;
        this.mv = sqlResult.Mv;
        this.mvr = sqlResult.Mvr;
        this.spelldam = sqlResult.Spelldam;
        this.spellcrit = sqlResult.Spellcrit;
        this.manaReduction = sqlResult.ManaReduction;
        this.mitigation = sqlResult.Mitigation;
        this.accuracy = sqlResult.Accuracy;
        this.ammo = sqlResult.Ammo;
        this.twoHanded = sqlResult.TwoHanded;
        this.quality = sqlResult.Quality;
        this.maxDam = sqlResult.MaxDam;
        this.avgDam = sqlResult.AvgDam;
        this.minDam = sqlResult.MinDam;
        this.parry = sqlResult.Parry;
        this.holdable = sqlResult.Holdable;
        this.rent = sqlResult.Rent;
        this.value = sqlResult.Value;
        this.weight = sqlResult.Weight;
        this.speedFactor = sqlResult.SpeedFactor;
        this.notes = sqlResult.Notes;
        this.modifiedBy = sqlResult.ModifiedBy;
        this.modifiedOn = sqlResult.ModifiedOn;
        this.uniqueWear = sqlResult.UniqueWear;
        this.modifiedByIP = sqlResult.ModifiedByIP;
        this.modifiedByIPForward = sqlResult.ModifiedByIPForward;
        this.alignRestriction = sqlResult.AlignRestriction;
        this.bonded = sqlResult.Bonded;
        this.casts = sqlResult.Casts;
        this.level = sqlResult.Level;
        this.netStat = sqlResult.NetStat;
        this.concentration = sqlResult.Concentration;
        this.rangedAccuracy = sqlResult.RangedAccuracy;
        this.mobId = sqlResult.MobId;
        this.questId = sqlResult.QuestId;
        this.weaponType = sqlResult.WeaponType;
        this.weaponStat = sqlResult.WeaponStat;
        this.isLight = sqlResult.IsLight;
        this.isHeroic = sqlResult.IsHeroic;
    }

    getMob() {
        if (!this.mobId)
            return null;

        let mobId = this.mobId;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ mobSchema.selectSQL.mobSelectSQL } WHERE M.Id = ?`,
                [mobId],
                function(error, results, fields) {
                    if (error)
                        reject(error);

                    if (results.length > 0)
                        resolve(new mobSchema.classes.Mob(results[0]));
                    else
                        reject(Error(`Mob with id (${mobId}) not found.`));
                });
        });
    }

    getQuest() {
        if (!this.questId)
            return null;

        let questId = this.questId;
        return new Promise(function(resolve, reject) {
            mysql.query(`${ questSchema.selectSQL.questSelectSQL } WHERE Id = ?`,
                [questId],
                function(error, results, fields) {
                    if (error)
                        reject(error);

                    if (results.length > 0)
                        resolve(new questSchema.classes.Quest(results[0]));
                    else
                        reject(Error(`Quest with id (${questId}) not found`));
                });
        });
    }
}

let getItemById = function(id) {
    if (!id)
        return null;

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } WHERE Id = ?`,
            [id],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0)
                    resolve(new Item(results[0]));
                else
                    reject(Error(`Item with id (${id}) not found.`));
            });
    });
};

let getItemByIdIn = function(ids) {
    if (ids.length === 0)
        return [];

    return new Promise(function(resolve, reject) {
        mysql.query(`${ itemSelectSQL } WHERE Id IN (?)`,
            [ids],
            function(error, results, fields) {
                if (error)
                    reject(error);

                if (results.length > 0) {
                    let response = [];
                    for (let i = 0; i < results.length; ++i) {
                        response.push(new Item(results[i]));
                    }
                    resolve(response);
                }
                else {
                    reject(Error(`Items with ids (${ids}) not found.`));
                }
            });
    });
};

let itemType = new graphql.GraphQLObjectType({
    name: "Item",
    fields: () => ({
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)  },
        slot: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        strength: { type: graphql.GraphQLInt  },
        mind: { type: graphql.GraphQLInt  },
        dexterity: { type: graphql.GraphQLInt  },
        constitution: { type: graphql.GraphQLInt  },
        perception: { type: graphql.GraphQLInt  },
        spirit: { type: graphql.GraphQLInt  },
        ac: { type: graphql.GraphQLInt  },
        hit: { type: graphql.GraphQLInt  },
        dam: { type: graphql.GraphQLInt  },
        hp: { type: graphql.GraphQLInt  },
        hpr: { type: graphql.GraphQLInt  },
        ma: { type: graphql.GraphQLInt  },
        mar: { type: graphql.GraphQLInt  },
        mv: { type: graphql.GraphQLInt  },
        mvr: { type: graphql.GraphQLInt  },
        spelldam: { type: graphql.GraphQLInt  },
        spellcrit: { type: graphql.GraphQLInt  },
        manaReduction: { type: graphql.GraphQLInt  },
        mitigation: { type: graphql.GraphQLInt  },
        accuracy: { type: graphql.GraphQLInt  },
        ammo: { type: graphql.GraphQLInt  },
        twoHanded: { type: graphql.GraphQLBoolean  },
        quality: { type: graphql.GraphQLInt  },
        maxDam: { type: graphql.GraphQLInt  },
        avgDam: { type: graphql.GraphQLInt  },
        minDam: { type: graphql.GraphQLInt  },
        parry: { type: graphql.GraphQLInt  },
        holdable: { type: graphql.GraphQLBoolean  },
        rent: { type: graphql.GraphQLInt  },
        value: { type: graphql.GraphQLInt  },
        weight: { type: graphql.GraphQLFloat  },
        speedFactor: { type: graphql.GraphQLInt  },
        notes: { type: graphql.GraphQLString  },
        modifiedBy: { type: new graphql.GraphQLNonNull(graphql.GraphQLString)  },
        modifiedOn: { type: new graphql.GraphQLNonNull(GraphQLDateTime)  },
        uniqueWear: { type: graphql.GraphQLBoolean  },
        modifiedByIP: { type: graphql.GraphQLString  },
        modifiedByIPForward: { type: graphql.GraphQLString  },
        alignRestriction: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)  },
        bonded: { type: graphql.GraphQLBoolean  },
        casts: { type: graphql.GraphQLString  },
        level: { type: graphql.GraphQLInt  },
        netStat: { type: graphql.GraphQLFloat  },
        concentration: { type: graphql.GraphQLInt  },
        rangedAccuracy: { type: graphql.GraphQLInt  },
        mobId: { type: graphql.GraphQLInt  },
        questId: { type: graphql.GraphQLInt  },
        weaponType: { type: graphql.GraphQLInt  },
        weaponStat: { type: graphql.GraphQLInt  },
        isLight: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)  },
        isHeroic: { type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)  },

        getMob: { type: mobSchema.types.mobType },
        getQuest: { type: questSchema.types.questType }
    })
});

let qFields = {
    getItemById: {
        type: itemType,
        args: {
            id: { type: graphql.GraphQLInt }
        },
        resolve: function(_, {id}) {
            return getItemById(id);
        }
    },
    getItemByIdIn: {
        type: new graphql.GraphQLList(itemType),
        args: {
            ids: { type: new graphql.GraphQLList(graphql.GraphQLInt) }
        },
        resolve: function(_, {ids}) {
            return getItemByIdIn(ids);
        }
    }
};

module.exports.queryFields = qFields;
module.exports.types = { itemType };
module.exports.classes = { Item };
module.exports.selectSQL = { itemSelectSQL };
