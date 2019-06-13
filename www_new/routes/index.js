let express = require("express");
let router = express.Router();

router.get(["/", "index.html"], function(req, res, next) {
  res.render("index", {});
});

router.get(["/login.html"], function(req, res, next) {
    res.render("login", {});
});

module.exports = router;
