let express = require("express");
let router = express.Router();
let request = require("request");
let itemApi = require("./api/items");

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
        url: "http://localhost:7001/api",
        form: {
            query: getItemsQuery
        }
    },
    function(error, response, body) {
        if (error) {
            res.render("errors/500", { error: error });
        }
        else {
            let data = JSON.parse(body).data;
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
            res.render("items/index", { vm });
        }
    });
});

module.exports = router;
