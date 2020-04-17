let router = require("express").Router();
let request = require("request");
let itemApi = require("./api/items");
let apiUtils = require("./api/utils");

router.get(["/", "/index.html"], async function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    if (page < 1) page = 1;
    let rows = 20;
    let getItemsQuery = `
    ${itemApi.fragment}

    {
        getItems(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}",`}
        ${req.query.filters === undefined ? '' : `filterString:"${req.query.filters}",`}
        ${req.query.sortBy === undefined ? '' : `sortBy:"${req.query.sortBy}",`}
        ${req.query.sortAsc === undefined ? '' : `sortAsc:${req.query.sortAsc},`}
        page:${page}
        rows:${rows}) {
            moreResults
            items {
                ... ItemAll
            }
        }
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                filterString
                showColumnDefault
            }
        }
        getItemStatInfo {
            display
            short
            var
            type
            filterString
            showColumnDefault
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getItemsQuery);
    }
    catch (e) {
        return next(e);
    }

    let items = data.getItems.items;
    let moreResults = data.getItems.moreResults;
    let statCategories = data.getItemStatCategories;
    let statInfo = data.getItemStatInfo;

    let selectedColumns = [];
    if (req.cookies.sc2) {
        selectedColumns = req.cookies.sc2.split('-');
    }
    else {
        for (let i = 0; i < statInfo.length; ++i) {
            if (statInfo[i].showColumnDefault) {
                selectedColumns.push(statInfo[i].short);
            }
        }
    }

    let selectedFilters = {};
    if (req.query.filters) {
        let filterStrings = req.query.filters.split(",");
        for (let i = 0; i < filterStrings.length; ++i) {
            let splitFilter = filterStrings[i].split("_");
            selectedFilters[splitFilter[0]] = splitFilter.slice(1);
        }
    }

    let vm = {
        query: req.query,
        noSearch: req.query.search === undefined && !req.query.filters,
        searchString: req.query.search,
        results: items,
        moreResults: moreResults,
        page: page,
        rows: rows,
        selectedColumns: selectedColumns,
        selectedFilters: selectedFilters,
        itemStatCategories: statCategories,
        itemStatInfo: statInfo,
        constants: itemApi.constants,
        cookies: req.cookies
    };
    let title = vm.noSearch ? "Recent Items" : `${items.length}${moreResults?"+":""} item results for "${req.query.search || ""}"`;
    res.render("items/index", { title, vm });
});

router.get(["/details.html"], async function(req, res, next) {
    if (res.locals.user)
        res.locals.user.notifications = await apiUtils.handleNotifications(req.cookies.loginToken, res.locals.user.notifications, 'item', req.query.id);

    let getItemQuery = `${itemApi.fragment}

    {
        getItemById(id:${req.query.id}) {
            ... ItemAll
            getMob {
                id
                name
                areaName
            }
            getQuest {
                id
                title
                areaName
            }
            getHistories {
                id
                item {
                    ... ItemAll
                }
            }
        }
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                filterString
                showColumnDefault
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getItemQuery);
    }
    catch (e) {
        return next(e);
    }
    let item = data.getItemById;
    let statCategories = data.getItemStatCategories;

    let vm = {
        item,
        statCategories,
        constants: itemApi.constants,
    }
    let title = item.name;
    res.locals.breadcrumbs = [
        {
            "display": "Items",
            "href": "/items/",
        },
        {
            "display": item.name,
            "active": true
        }
    ];
    res.render("items/display", { title, vm });
});

router.get(["/history.html"], async function(req, res, next) {
    let getItemQuery = `${itemApi.fragment}

    {
        getItemHistoryById(id:${req.query.id}) {
            item {
                ... ItemAll
                getMob {
                    id
                    name
                    areaName
                }
                getQuest {
                    id
                    title
                    areaName
                }
                getHistories {
                    id
                    item {
                        ... ItemAll
                    }
                }
            }
        }
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                filterString
                showColumnDefault
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(getItemQuery);
    }
    catch (e) {
        return next(e);
    }
    let item = data.getItemHistoryById.item;
    let statCategories = data.getItemStatCategories;

    let vm = {
        item,
        statCategories,
        constants: itemApi.constants,
        historyId: req.query.id
    }
    let title = `History for ${item.name}`;

    res.locals.breadcrumbs = [
        {
            display: "Items",
            href: "/items/",
        },
        {
            display: item.name,
            href: `/items/details.html?id=${item.id}`
        },
        {
            display: new Date(item.modifiedOn).toISOString().slice(0, 16).replace("T", " ") + " UTC",
            active: true
        }
    ];
    res.render("items/display", { title, vm });
});

router.get(["/revert.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let revertQuery = `
    mutation {
        revertItem (authToken:"${req.cookies.loginToken}",historyId:${req.query.id}) {
            id
            tokenRenewal {
                token
                expires
            }
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync(revertQuery, req.ip);
    }
    catch (e) {
        return next(e);
    }

    let itemId = data.id;
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
    res.redirect(`/items/details.html?id=${data.id}`);
});

router.get(["/add.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let query = `
    {
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                editable
                defaultValue
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

    let itemStatCategories = data.getItemStatCategories;
    let title = "Add Item";
    let vm = {
        itemStatCategories,
        constants: itemApi.constants
    };
    res.locals.breadcrumbs = [
        {
            display: "Items",
            href: "/items/",
        },
        {
            display: "Add",
            active: true
        }
    ];
    res.render("items/modify", {title, vm})
});

router.get(["/edit.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let query = `
    {
        getItemById(id:${req.query.id}) {
            id
            name
        }
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                editable
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

    let item = data.getItemById;
    let itemStatCategories = data.getItemStatCategories;
    let title = `Edit ${item.name}`;
    let vm = {
        item,
        itemFragment: itemApi.fragment,
        itemStatCategories,
        constants: itemApi.constants
    };

    res.locals.breadcrumbs = [
        {
            display: "Items",
            href: "/items/",
        },
        {
            display: item.name,
            href: `/items/details.html?id=${item.id}`
        },
        {
            display: "Edit",
            active: true
        }
    ];
    res.render("items/modify", {title, vm});
});

router.get(["/delete.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let deleteQuery = `
    mutation {
        deleteItem (authToken:"${req.cookies.loginToken}", id:${req.query.id}) {
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
        data.deleteItem.token,
        {
            path: "/",
            expires: data.deleteItem.expires,
            secure: true,
            sameSite: true
        }
    );
    res.redirect(`/items/`);
});


module.exports = router;
