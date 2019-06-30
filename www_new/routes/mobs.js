var express = require("express");
var router = express.Router();
let request = require("request");
let auth = require("./api/auth");

router.get(["/", "/index.html"], function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let getMobsQuery = `
    {
        getMobs(
        ${req.query.search === undefined ? '' : `searchString:"${req.query.search}"`}
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
            res.status(body.errors[0].code);
            res.render(`error/${body.errors[0].code}`, {errors: body.errors});
            return;
        }

        console.log(body);
        let data = body.data;
        let mobs = data.getMobs.mobs;
        let moreResults = data.getMobs.moreResults;

        let vm = {
            query: req.query,
            searchString: req.query.search,
            results: mobs,
            page: page,
            rows: rows,
            cookies: req.cookies
        };
        let title = req.query.search === undefined ? "Recent Mobs" : `Results for "${req.query.search}"`;
        res.render("mobs/index", {title, vm});
    });
});

module.exports = router;
