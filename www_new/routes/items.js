var express = require("express");
var router = express.Router();

router.get(["/", "/index.html"], function(req, res, next) {
    res.render("items/index", {title: "Express" });
});

module.exports = router;
