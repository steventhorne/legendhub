var express = require("express");
var router = express.Router();
let request = require("request");
let itemApi = require("./api/items");

router.get(["/", "/index.html"], function(req, res, next) {
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
    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getMobsQuery
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
        let title = req.query.search === undefined ? "Recent Mobs" : `Results for "${req.query.search}"`;
        res.render("mobs/index", {title, vm});
    });
});

router.get(["/details.html"], function(req, res, next) {
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

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getMobQuery
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

        let mob = body.data.getMobById;
        let vm = {
            mob,
            constants: itemApi.constants
        }
        let title = mob.name;
        res.render("mobs/display", {title, vm});
    });
});

router.get(["/history.html"], function(req, res, next) {
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

    request.post(
        {
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: getMobQuery
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
            let mob = data.getMobHistoryById.mob;
            let vm = {
                mob,
                constants: itemApi.constants,
                historyId: req.query.id
            };
            let title = `History for ${mob.name}`;
            res.render("mobs/display", {title, vm});
        }
    )
});

router.get(["/edit.html"], function(req, res, next) {
    let getMobQuery = `
    {
        getMobById(id:${req.query.id}) {
            id
            name
            xp
            areaId
            eraId
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

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getMobQuery
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
            mob: body.data.getMobById,
            areas: body.data.getAreas
        }
        let title = "Edit Mob";
        res.render("mobs/modify", {title, vm});
    });
});

router.get(["/add.html"], function(req, res, next) {
    let getMobQuery = `
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
            query: getMobQuery
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
        let title = "Add Mob";
        res.render("mobs/modify", {title, vm});
    });
});

router.get(["/revert.html"], function(req, res, next) {
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
    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: revertQuery
        }
    }, function (error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let data = body.data.revertMob;
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
});

module.exports = router;
