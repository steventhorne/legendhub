let express = require("express");
let router = express.Router();
let auth = require("./api/auth");

router.get(["/", "index.html"], function(req, res, next) {
    res.render("index", {title: "Home"});
});

router.get(["/login.html"], function(req, res, next) {
    res.render("login", {title: "Login"});
});

router.get(["/logout.html"], function(req, res, next) {
    if (req.cookies.loginToken) {
        auth.utils.logout(req.cookies.loginToken);
        delete res.clearCookie("loginToken", { path: "/" });
    }

    res.redirect("/");
});

router.get(["/cookies.html"], function(req, res, next) {
    res.render("cookies", {title: "Cookie Policy"});
})

module.exports = router;
