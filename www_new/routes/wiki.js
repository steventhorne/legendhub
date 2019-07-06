var express = require("express");
var router = express.Router();
let request = require("request");

router.get(["/", "/index.html"], function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let getWikiPagesQuery = `
    {
        getWikiPages(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}"`}
        ${req.query.eraId === undefined ? '' : `eraId:${req.query.eraId}`}
        ${req.query.areaId === undefined ? '' : `areaId:${req.query.areaId}`}
        ${req.query.sortBy === undefined ? '' : `sortBy:"${req.query.sortBy}"`}
        ${req.query.sortAsc === undefined ? '' : `sortAsc:${req.query.sortAsc}`}
        page:${page}
        rows:${rows}) {
            moreResults
            wikiPages {
                id
                title
                categoryName
                subcategoryName
            }
        }
        getCategories {
            id
            name
            getSubcategories {
                id
                name
            }
        }
    }
    `;
    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getWikiPagesQuery
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
        let categories = data.getCategories;
        let activeCategory = "";
        for (let i = 0; i < categories.length; ++i) {
            categories[i].subcategories = categories[i].getSubcategories;

            if (categories[i].id == req.query.categoryId) {
                if (req.query.subcategoryId) {
                    for (let j = 0; j < categories[i].subcategories.length; ++j) {
                        if (categories[i].subcategories[j].id == req.query.subcategoryId)
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
            results: data.getWikiPages.wikiPages,
            moreResults: data.getWikiPages.morePages,
            page: page,
            rows: rows,
            categories: categories,
            categoryId: req.query.categoryId,
            subcategoryId: req.query.subcategoryId,
            activeCategory: activeCategory,
            cookies: req.cookies
        };
        let title = req.query.search === undefined ? "Recent Wiki Pages" : `Results for "${req.query.search}"`;
        res.render("quests/index", {title, vm});
    });
});

router.get(["/details.html"], function(req, res, next) {
    let query = `
    {
        getWikiPageById(id:${req.query.id}) {
            id
            title
            content

            getHistories {
                id
                wikiPage {
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

        let wikiPage = body.data.getWikiPageById;
        let vm = {
            wikiPage
        };
        let title = wikiPage.title;
        res.render("quests/display", {title, vm});
    });
});

router.get(["/history.html"], function(req, res, next) {
    let query = `
    {
        getWikiPageHistoryById(id:${req.query.id}) {
            wikiPage {
                id
                title
                content

                getHistories {
                    id
                    wikiPage {
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

        let wikiPage = body.data.getWikiPageHistoryById.wikiPage;
        let vm = {
            wikiPage,
            historyId: req.query.id
        };
        let title = `History for ${wikiPage.title}`;
        res.render("wiki/display", {title, vm});
    });
});

router.get(["/edit.html"], function(req, res, next) {
    let query = `
    {
        getWikiPageById(id:${req.query.id}) {
            id
            title
            categoryId
            subcategoryId
            tags
            content
        }
        getCategories {
            id
            name
            getSubcategories {
                id
                name
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

        let vm = {
            wikiPage: body.data.getWikiPageById,
            categories: body.data.getCategories
        };
        let title = "Edit Wiki Page";
        res.render("wiki/modify", {title, vm});
    });
});

router.get(["/add.html"], function(req, res, next) {
    let query = `
    {
        getCategories {
            id
            name
            getSubcategories {
                id
                name
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

        let vm = {
            categories: body.data.getCategories
        };
        let title = "Add Wiki Page";
        res.render("wiki/modify", {title, vm});
    });
});

router.get([""], function(req, res, next) {
    let query = `
    mutation {
        revertWikiPage (authToken:"${req.cookies.loginToken}",historyId:${req.query.id}) {
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

        let data = body.data.revertWikiPage;
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
        res.redirect(`/wiki/details.html?id=${data.id}`);
    });
});

module.exports = router;
