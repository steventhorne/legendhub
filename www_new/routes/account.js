let express = require("express");
let router = express.Router();
let apiUtils = require("./api/utils");
let auth = require("./api/auth");

router.get(["/", "/index.html"], async function(req, res, next) {
    if (!res.locals.user)
        return res.redirect(`/login.html?returnUrl=${encodeURIComponent(res.locals.url.path)}`);

    let query = `
    {
        getNotificationSettings(authToken:"${req.cookies.loginToken}") {
            itemAdded
            itemUpdated
            mobAdded
            mobUpdated
            questAdded
            questUpdated
            wikiPageAdded
            wikiPageUpdated
            changelogAdded
        }
    }
    `;
    try {
        var data = await apiUtils.postAsync(query);
    }
    catch(e) {
        return next(e);
    }

    let vm = {
        notificationSettings: data.getNotificationSettings
    };
    res.render("account/index", {title: "Account", vm});
});

module.exports = router;
