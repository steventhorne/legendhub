let express = require("express");
let router = express.Router();
let apiUtils = require("./api/utils");
let auth = require("./api/auth");

router.get(["/", "/index.html"], async function(req, res, next) {
    if (!res.locals.user) {
        let error = new Error("You must be logged in to view this page.");
        error.status = 401;
        return next(error);
    }

    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let query = `
    {
        getNotifications(
        authToken:"${req.cookies.loginToken}"
        page:${page}
        rows:${rows}) {
            moreResults
            results {
                message
                link
                createdOn
                read
            }
        }
    }
    `;
    try {
        var data = await apiUtils.postAsync({
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query
            }
        });
    }
    catch (e) {
        return next(e);
    }

    let vm = {
        query: req.query,
        results: data.getNotifications.results,
        moreResults: data.getNotifications.moreResults,
        page: page,
        rows: rows,
        cookies: req.cookies
    };
    let title = "Notifications";
    res.render("notifications/index", {title, vm});
});

module.exports = router;
