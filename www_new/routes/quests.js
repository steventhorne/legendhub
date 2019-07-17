var express = require("express");
var router = express.Router();
let request = require("request");
let itemApi = require("./api/items");

router.get(["/", "/index.html"], function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let getQuestsQuery = `
    {
        getQuests(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}"`}
        ${req.query.eraId === undefined ? '' : `eraId:${req.query.eraId}`}
        ${req.query.areaId === undefined ? '' : `areaId:${req.query.areaId}`}
        ${req.query.stat === undefined ? '' : `stat:${req.query.stat}`}
        ${req.query.sortBy === undefined ? '' : `sortBy:"${req.query.sortBy}"`}
        ${req.query.sortAsc === undefined ? '' : `sortAsc:${req.query.sortAsc}`}
        page:${page}
        rows:${rows}) {
            moreResults
            quests {
                id
                title
                eraName
                areaName
            }
        }
        getEras {
            id
            name
            getAreas {
                id
                name
            }
        }
    }
    `;
    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getQuestsQuery
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let data = body.data;
        let categories = data.getEras;
        let activeCategory = "";
        for (let i = 0; i < categories.length; ++i) {
            categories[i].subcategories = categories[i].getAreas;

            if (categories[i].id == req.query.eraId) {
                if (req.query.areaId) {
                    for (let j = 0; j < categories[i].subcategories.length; ++j) {
                        if (categories[i].subcategories[j].id == req.query.areaId)
                            activeCategory = categories[i].subcategories[j].name;
                    }
                }
                else {
                    activeCategory = categories[i].name;
                }
            }
        }

        let vm = {
            query: req.query,
            noSearch: req.query.search == null && !req.query.eraId && !req.query.areaId,
            results: data.getQuests.quests,
            moreResults: data.getQuests.moreResults,
            page: page,
            rows: rows,
            categories: categories,
            categoryId: req.query.eraId,
            subcategoryId: req.query.areaId,
            activeCategory: activeCategory,
            cookies: req.cookies
        };
        let title = vm.noSearch ? "Recent Quests" : `Results for "${req.query.search || ""}"`;
        res.render("quests/index", {title, vm});
    });
});

router.get(["/details.html"], function(req, res, next) {
    let query = `
    {
        getQuestById(id:${req.query.id}) {
            id
            title
            areaId
            areaName
            eraId
            eraName
            stat
            content
            whoises
            modifiedOn
            modifiedBy

            getItems {
                id
                name
                slot
            }

            getHistories {
                id
                quest {
                    modifiedBy
                    modifiedOn
                }
            }
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let quest = body.data.getQuestById;
        let vm = {
            quest,
            constants: itemApi.constants
        };
        let title = quest.title;
        res.locals.breadcrumbs = [
            {
                "display": "Quests",
                "href": "/quests/",
            }
        ];
        if (quest.eraId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.eraName,
                    href: `/quests/index.html?eraId=${quest.eraId}`
                }
            )
        }
        if (quest.areaId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.areaName,
                    href: `/quests/index.html?eraId=${quest.eraId}&areaId=${quest.areaId}`
                }
            )
        }
        res.locals.breadcrumbs.push(
            {
                "display": quest.title,
                "active": true
            }
        );
        res.render("quests/display", {title, vm});
    });
});

router.get(["/history.html"], function(req, res, next) {
    let query = `
    {
        getQuestHistoryById(id:${req.query.id}) {
            quest {
                id
                title
                areaId
                areaName
                eraId
                eraName
                stat
                content
                whoises
                modifiedOn
                modifiedBy

                getItems {
                    id
                    name
                    slot
                }

                getHistories {
                    id
                    quest {
                        modifiedBy
                        modifiedOn
                    }
                }
            }
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let quest = body.data.getQuestHistoryById.quest;
        let vm = {
            quest,
            constants: itemApi.constants,
            historyId: req.query.id
        };
        let title = `History for ${quest.title}`;
        res.locals.breadcrumbs = [
            {
                display: "Quests",
                href: "/quests/",
            }
        ];
        if (quest.eraId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.eraName,
                    href: `/quests/index.html?eraId=${quest.eraId}`
                }
            )
        }
        if (quest.areaId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.areaName,
                    href: `/quests/index.html?eraId=${quest.eraId}&areaId=${quest.areaId}`
                }
            )
        }
        res.locals.breadcrumbs.push(
            {
                display: quest.title,
                href: `/quests/details.html?id=${quest.id}`
            },
            {
                display: new Date(quest.modifiedOn).toISOString().slice(0, 16).replace("T", " ") + " UTC",
                active: true
            }
        );
        res.render("quests/display", {title, vm});
    });
});

router.get(["/edit.html"], function(req, res, next) {
    let query = `
    {
        getQuestById(id:${req.query.id}) {
            id
            title
            eraId
            eraName
            areaId
            areaName
            stat
            whoises
            content
        }
        getAreas {
            id
            name
            eraName
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let quest = body.data.getQuestById;
        let vm = {
            quest,
            areas: body.data.getAreas
        };
        let title = "Edit Quest";
        res.locals.breadcrumbs = [
            {
                display: "Quests",
                href: "/quests/",
            }
        ];
        if (quest.eraId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.eraName,
                    href: `/quests/index.html?eraId=${quest.eraId}`
                }
            )
        }
        if (quest.areaId) {
            res.locals.breadcrumbs.push(
                {
                    "display": quest.areaName,
                    href: `/quests/index.html?eraId=${quest.eraId}&areaId=${quest.areaId}`
                }
            )
        }
        res.locals.breadcrumbs.push(
            {
                display: quest.title,
                href: `/quests/details.html?id=${quest.id}`
            },
            {
                display: "Edit",
                active: true
            }
        );
        res.render("quests/modify", {title, vm});
    });
});

router.get(["/add.html"], function(req, res, next) {
    let query = `
    {
        getAreas {
            id
            name
            eraName
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let vm = {
            areas: body.data.getAreas
        };
        let title = "Add Quest";
        res.locals.breadcrumbs = [
            {
                display: "Quests",
                href: "/quests/",
            },
            {
                display: "Add",
                active: true
            }
        ];
        res.render("quests/modify", {title, vm});
    });
});

router.get([""], function(req, res, next) {
    let query = `
    mutation {
        revertQuest (authToken:"${req.cookies.loginToken}",historyId:${req.query.id}) {
            id
            tokenRenewal {
                token
                expires
            }
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let data = body.data.revertQuest;
        res.cookie(
            "loginToken",
            data.tokenRenewal.token,
            {
                path: "/",
                expires: data.tokenRenewal.expires,
                secure: true,
                sameSite: true
            }
        );
        res.redirect(`quests/details.html?id=${data.id}`);
    });
});

module.exports = router;
