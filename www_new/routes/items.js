let express = require("express");
let router = express.Router();
let request = require("request");
let itemApi = require("./api/items");

router.get(["/details.html"], function(req, res, next) {
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

    request.post(
        {
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: getItemQuery
            }
        },
        function(error, response, body){
            body = JSON.parse(body);
            if (body.errors) {
                res.render("error/500", {errors: body.errors});
                return;
            }

            let data = body.data;
            let item = data.getItemById;
            let statCategories = data.getItemStatCategories;

            let vm = {
                item,
                statCategories,
                constants: itemApi.constants,
            }
            let title = item.name;
            res.render("items/display", { title, vm });
        }
    )
});

router.get(["/history.html"], function(req, res, next) {
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

    request.post(
        {
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: getItemQuery
            }
        },
        function(error, response, body){
            body = JSON.parse(body);
            if (body.errors) {
                res.render("error/500", {errors: body.errors});
                return;
            }

            let data = body.data;
            let item = data.getItemHistoryById.item;
            let statCategories = data.getItemStatCategories;

            let vm = {
                item,
                statCategories,
                constants: itemApi.constants,
                historyId: req.query.id
            }
            let title = `History for ${item.name}`;
            res.render("items/display", { title, vm });
        }
    );
});

router.get(["/revert.html"], function(req, res, next) {
    let revertQuery = `
    mutation {
        revertItem (authToken:"${req.cookies.authToken}",id:${req.query.id}) {
            id
            tokenRenewal {
                token
                expires
            }
        }
    }
    `;

    request.post(
        {
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: revertQuery
            }
        },
        function(error, response, body) {
            body = JSON.parse(body);
            if (body.errors) {
                res.render("error/500", {errors: body.errors});
                return;
            }

            let data = body.data;
            let itemId = data.id;
            res.cookie(
                "authToken",
                data.tokenRenewal.token,
                {
                    domain: `${process.env.BETA ? "beta" : "www"}.legendhub.org`,
                    path: "/",
                    expires: data.tokenRenewal.expires,
                    secure: true,
                    sameSite: true
                }
            );
            res.redirect(`/items/details.html?id=${data.id}`);
        }
    );
});

router.get(["/", "/index.html"], function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
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

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getItemsQuery
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            res.render("error/500", {errors: body.errors});
            return;
        }

        let data = body.data;
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
        let title = req.query.search === undefined ? "Recent Items" : `Results for "${req.query.search}"`;
        res.render("items/index", { title, vm });
    });
});

module.exports = router;
