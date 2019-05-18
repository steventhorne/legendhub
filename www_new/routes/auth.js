var express = require("express");
var router = express.Router();

var authFunc = function(req, res, next) {
    next();
};

module.exports = authFunc;
