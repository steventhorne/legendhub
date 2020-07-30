var router = require("express").Router();
let request = require("request");
let itemApi = require("./api/items");
let apiUtils = require("./api/utils");

router.get(["/", "/index.html"], async function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    if (page < 1) page = 1;
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

    try {
        var data = await apiUtils.postAsync(getQuestsQuery);
    }
    catch (e) {
        next(e);
    }

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
    let title = vm.noSearch ? "Recent Quests" : `${data.getQuests.quests.length}${data.getQuests.moreResults?"+":""} quest results for "${req.query.search || ""}"`;
    res.render("quests/index", {title, vm});
});

router.get(["/details.html"], async function(req, res, next) {
    if (res.locals.user)
        res.locals.user.notifications = await apiUtils.handleNotifications(req.cookies.loginToken, res.locals.user.notifications, 'quest', req.query.id);

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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let quest = data.getQuestById;
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

router.get(["/history.html"], async function(req, res, next) {
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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let quest = data.getQuestHistoryById.quest;
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

router.get(["/edit.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let quest = data.getQuestById;
    let vm = {
        quest,
        areas: data.getAreas
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

router.get(["/add.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let query = `
    {
        getAreas {
            id
            name
            eraName
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let vm = {
        quest: {
            whoises: "",
            content: "",
            stat: ""
        },
        areas: data.getAreas
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

router.get(["/revert.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

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

    try {
        var data = await apiUtils.postAsync(query, req.ip);
    }
    catch (e) {
        return next(e);
    }

    data = data.revertQuest;
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

router.get(["/delete.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let deleteQuery = `
    mutation {
        deleteQuest (authToken:"${req.cookies.loginToken}", id:${req.query.id}) {
            token,
            expires
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(deleteQuery, req.ip);
    }
    catch (e) {
        return next(e);
    }

    res.cookie(
        "loginToken",
        data.deleteQuest.token,
        {
            path: "/",
            expires: data.deleteQuest.expires,
            secure: true,
            sameSite: true
        }
    );
    res.redirect(`/quests/`);
});

module.exports = router;
