var express = require("express");
var router = express.Router();

router.get(["/", "index.html"], function(req, res, next) {
  res.render("index", {});
});

module.exports = router;
