let express = require("express");
let router = express.Router();
let request = require("request");
let itemApi = require("./api/items");

router.get(["/", "/index.html"], function(req, res, next) {
    let getItemsQuery = `
    ${itemApi.fragment}

    {
        getItems(searchString:"${req.query.search}", filterString:"${req.query.filters}") {
            ... ItemAll
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
            let items = data.getItems;
            let categories = data.getItemStatCategories;

            let viewModel = {
                results: items,
                itemStatCategories: categories,
                searchString: req.query.search,
                filterItems: ""
            };
            res.render("items/index", { viewModel });
        }
    });
});

module.exports = router;
