let express = require("express");
let router = express.Router();
let apiUtils = require("./api/utils");
let auth = require("./api/auth");

router.get(["/", "/index.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

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
        var data = await apiUtils.postAsync(query);
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
