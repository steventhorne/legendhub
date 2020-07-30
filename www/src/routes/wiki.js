let router = require("express").Router();
let request = require("request");
let apiUtils = require("./api/utils");

router.get(["/", "/index.html"], async function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    if (page < 1) page = 1;
    let rows = 20;
    let getWikiPagesQuery = `
    {
        getWikiPages(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}"`}
        ${req.query.categoryId === undefined ? '' : `categoryId:${req.query.categoryId}`}
        ${req.query.subcategoryId === undefined ? '' : `subcategoryId:${req.query.subcategoryId}`}
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
                pinnedRecent
                pinnedSearch
                locked
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

    try {
        var data = await apiUtils.postAsync(getWikiPagesQuery);
    }
    catch (e) {
        return next(e);
    }

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
        noSearch: req.query.search == null && !req.query.categoryId && !req.query.subcategoryId,
        results: data.getWikiPages.wikiPages,
        moreResults: data.getWikiPages.moreResults,
        page: page,
        rows: rows,
        categories: categories,
        categoryId: req.query.categoryId,
        subcategoryId: req.query.subcategoryId,
        activeCategory: activeCategory,
        cookies: req.cookies
    };
    let title = vm.noSearch ? "Recent Wiki Pages" : `${data.getWikiPages.wikiPages.length}${data.getWikiPages.moreResults?"+":""} wiki results for "${req.query.search || ""}"`;
    res.render("wiki/index", {title, vm});
});

router.get(["/details.html"], async function(req, res, next) {
    if (res.locals.user)
        res.locals.user.notifications = await apiUtils.handleNotifications(req.cookies.loginToken, res.locals.user.notifications, 'wiki page', req.query.id);

    let query = `
    {
        getWikiPageById(id:${req.query.id}) {
            id
            title
            categoryId
            categoryName
            subcategoryId
            subcategoryName
            content
            modifiedOn
            modifiedBy

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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let wikiPage = data.getWikiPageById;
    let vm = {
        wikiPage
    };
    let title = wikiPage.title;
    res.locals.breadcrumbs = [
        {
            display: "Wiki",
            href: "/wiki/"
        }
    ];
    if (wikiPage.categoryName) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.categoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}`
            }
        )
    }
    if (wikiPage.subcategoryName) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.subcategoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}&subcategoryId=${wikiPage.subcategoryId}`
            }
        )
    }
    res.locals.breadcrumbs.push(
        {
            display: wikiPage.title,
            active: true
        }
    );
    res.render("wiki/display", {title, vm});
});

router.get(["/history.html"], async function(req, res, next) {
    let query = `
    {
        getWikiPageHistoryById(id:${req.query.id}) {
            wikiPage {
                id
                title
                categoryId
                categoryName
                subcategoryId
                subcategoryName
                content
                modifiedOn
                modifiedBy

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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let wikiPage = data.getWikiPageHistoryById.wikiPage;
    let vm = {
        wikiPage,
        historyId: req.query.id
    };
    let title = `History for ${wikiPage.title}`;
    res.locals.breadcrumbs = [
        {
            display: "Wiki",
            href: "/wiki/"
        }
    ];
    if (wikiPage.categoryName) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.categoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}`
            }
        )
    }
    if (wikiPage.subcategoryName) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.subcategoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}&subcategoryId=${wikiPage.subcategoryId}`
            }
        )
    }
    res.locals.breadcrumbs.push(
        {
            display: wikiPage.title,
            href: `/wiki/details.html?id=${wikiPage.id}`
        },
        {
            display: new Date(wikiPage.modifiedOn).toISOString().slice(0, 16).replace("T", " ") + " UTC",
            active: true
        }
    );
    res.render("wiki/display", {title, vm});
});

router.get(["/edit.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let query = `
    {
        getWikiPageById(id:${req.query.id}) {
            id
            title
            categoryId
            categoryName
            subcategoryId
            subcategoryName
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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }


    let subcategories = {};
    for (let i = 0; i < data.getCategories.length; ++i) {
        subcategories[data.getCategories[i].id] = data.getCategories[i].getSubcategories;
    }

    let wikiPage = data.getWikiPageById;
    let vm = {
        wikiPage,
        categories: data.getCategories,
        subcategories: subcategories
    };
    let title = "Edit Wiki Page";
    res.locals.breadcrumbs = [
        {
            display: "Wiki",
            href: "/wiki/",
        }
    ];
    if (wikiPage.categoryId) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.categoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}`
            }
        )
    }
    if (wikiPage.subcategoryId) {
        res.locals.breadcrumbs.push(
            {
                display: wikiPage.subcategoryName,
                href: `/wiki/index.html?categoryId=${wikiPage.categoryId}&subcategoryId=${wikiPage.subcategoryId}`
            }
        )
    }
    res.locals.breadcrumbs.push(
        {
            display: wikiPage.title,
            href: `/wiki/details.html?id=${wikiPage.id}`
        },
        {
            display: "Edit",
            active: true
        }
    );
    res.render("wiki/modify", {title, vm});
});

router.get(["/add.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

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

    try {
        var data = await apiUtils.postAsync(query);
    }
    catch (e) {
        return next(e);
    }

    let subcategories = {};
    for (let i = 0; i < data.getCategories.length; ++i) {
        subcategories[data.getCategories[i].id] = data.getCategories[i].getSubcategories;
    }

    let vm = {
        wikiPage: {
            tage: "",
            content: ""
        },
        categories: data.getCategories,
        subcategories: subcategories
    };
    let title = "Add Wiki Page";
    res.locals.breadcrumbs = [
        {
            display: "Wiki",
            href: "/wiki/",
        },
        {
            display: "Add",
            active: true
        }
    ];
    res.render("wiki/modify", {title, vm});
});

router.get(["/revert.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

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

    try {
        var data = await apiUtils.postAsync(query, req.ip);
    }
    catch (e) {
        return next(e);
    }

    data = data.revertWikiPage;
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

router.get(["/delete.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let deleteQuery = `
    mutation {
        deleteWikiPage (authToken:"${req.cookies.loginToken}", id:${req.query.id}) {
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
        data.deleteWikiPage.token,
        {
            path: "/",
            expires: data.deleteWikiPage.expires,
            secure: true,
            sameSite: true
        }
    );
    res.redirect(`/wiki/`);
});

module.exports = router;
