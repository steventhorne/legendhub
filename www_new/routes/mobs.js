let router = require("express").Router();
let request = require("request");
let itemApi = require("./api/items");
let apiUtils = require("./api/utils");

router.get(["/", "/index.html"], async function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let getMobsQuery = `
    {
        getMobs(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}"`}
        ${req.query.eraId === undefined ? '' : `eraId:${req.query.eraId}`}
        ${req.query.areaId === undefined ? '' : `areaId:${req.query.areaId}`}
        ${req.query.sortBy === undefined ? '' : `sortBy:"${req.query.sortBy}"`}
        ${req.query.sortAsc === undefined ? '' : `sortAsc:${req.query.sortAsc}`}
        page:${page}
        rows:${rows}) {
            moreResults
            mobs {
                id
                name
                eraName
                areaName
                xp
                gold
                aggro
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
        var data = await apiUtils.postAsync(getMobsQuery);
    }
    catch (e) {
        return next(e);
    }

    let mobs = data.getMobs.mobs;
    let moreResults = data.getMobs.moreResults;
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
        searchString: req.query.search,
        results: mobs,
        moreResults: moreResults,
        page: page,
        rows: rows,
        categories: categories,
        categoryId: req.query.eraId,
        subcategoryId: req.query.areaId,
        activeCategory: activeCategory,
        cookies: req.cookies
    };
    let title = vm.noSearch ? "Recent Mobs" : `${mobs.length}${moreResults?"+":""} mob results for "${req.query.search || ""}"`;
    res.render("mobs/index", {title, vm});
});

router.get(["/details.html"], async function(req, res, next) {
    if (res.locals.user)
        res.locals.user.notifications = await apiUtils.handleNotifications(req.cookies.loginToken, res.locals.user.notifications, 'mob', req.query.id);

    let getMobQuery = `
    {
        getMobById(id:${req.query.id}) {
            id
            name
            xp
            areaId
            areaName
            eraId
            eraName
            gold
            modifiedOn
            modifiedBy
            modifiedByIP
            notes
            aggro

            getItems {
                id
                name
                slot
            }

            getHistories {
                id
                mob {
                    modifiedBy
                    modifiedOn
                }
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getMobQuery);
    }
    catch (e) {
        return next(e);
    }

    let mob = data.getMobById;
    let vm = {
        mob,
        constants: itemApi.constants
    }
    let title = mob.name;
    res.locals.breadcrumbs = [
        {
            "display": "Mobs",
            "href": "/mobs/",
        }
    ];
    if (mob.eraId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.eraName,
                "href": `/mobs/index.html?eraId=${mob.eraId}`
            }
        );
    }
    if (mob.areaId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.areaName,
                "href": `/mobs/index.html?eraId=${mob.eraId}&areaId=${mob.areaId}`
            }
        );
    }
    res.locals.breadcrumbs.push(
        {
            "display": mob.name,
            "active": true
        }
    );
    res.render("mobs/display", {title, vm});
});

router.get(["/history.html"], async function(req, res, next) {
    let getMobQuery = `
    {
        getMobHistoryById(id:${req.query.id}) {
            mob {
                id
                name
                xp
                areaId
                areaName
                eraId
                eraName
                gold
                modifiedOn
                modifiedBy
                modifiedByIP
                notes
                aggro

                getItems {
                    id
                    name
                    slot
                }

                getHistories {
                    id
                    mob {
                        name
                        modifiedBy
                        modifiedOn
                    }
                }
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getMobQuery);
    }
    catch (e) {
        return next(e);
    }

    let mob = data.getMobHistoryById.mob;
    let vm = {
        mob,
        constants: itemApi.constants,
        historyId: req.query.id
    };
    let title = `History for ${mob.name}`;
    res.locals.breadcrumbs = [
        {
            display: "Mobs",
            href: "/mobs/",
        }
    ];
    if (mob.eraId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.eraName,
                "href": `/mobs/index.html?eraId=${mob.eraId}`
            }
        );
    }
    if (mob.areaId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.areaName,
                "href": `/mobs/index.html?eraId=${mob.eraId}&areaId=${mob.areaId}`
            }
        );
    }
    res.locals.breadcrumbs.push(
        {
            display: mob.name,
            href: `/mobs/details.html?id=${mob.id}`
        },
        {
            display: new Date(mob.modifiedOn).toISOString().slice(0, 16).replace("T", " ") + " UTC",
            active: true
        }
    );
    res.render("mobs/display", {title, vm});
});

router.get(["/edit.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let getMobQuery = `
    {
        getMobById(id:${req.query.id}) {
            id
            name
            xp
            areaId
            areaName
            eraId
            eraName
            gold
            notes
            aggro
        }
        getAreas {
            id
            name
            eraName
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getMobQuery);
    }
    catch (e) {
        return next(e);
    }

    let mob = data.getMobById;
    let vm = {
        mob,
        areas: data.getAreas
    }
    let title = "Edit Mob";
    res.locals.breadcrumbs = [
        {
            display: "Mobs",
            href: "/mobs/",
        }
    ];
    if (mob.eraId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.eraName,
                "href": `/mobs/index.html?eraId=${mob.eraId}`
            }
        );
    }
    if (mob.areaId) {
        res.locals.breadcrumbs.push(
            {
                "display": mob.areaName,
                "href": `/mobs/index.html?eraId=${mob.eraId}&areaId=${mob.areaId}`
            }
        );
    }
    res.locals.breadcrumbs.push(
        {
            display: mob.name,
            href: `/mobs/details.html?id=${mob.id}`
        },
        {
            display: "Edit",
            active: true
        }
    );
    res.render("mobs/modify", {title, vm});
});

router.get(["/add.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let getMobQuery = `
    {
        getAreas {
            id
            name
            eraName
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getMobQuery);
    }
    catch (e) {
        return next(e);
    }

    let vm = {
        areas: data.getAreas
    };
    let title = "Add Mob";
    res.locals.breadcrumbs = [
        {
            display: "Mobs",
            href: "/mobs/",
        },
        {
            display: "Add",
            active: true
        }
    ];
    res.render("mobs/modify", {title, vm});
});

router.get(["/revert.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let revertQuery = `
    mutation {
        revertMob (authToken:"${req.cookies.loginToken}",historyId:${req.query.id}) {
            id
            tokenRenewal {
                token
                expires
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(revertQuery);
    }
    catch (e) {
        return next(e);
    }

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
    res.redirect(`/mobs/details.html?id=${data.id}`);
});

module.exports = router;
