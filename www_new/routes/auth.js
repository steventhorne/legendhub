var express = require("express");
var authApi = require("./api/auth")
var router = express.Router();

var authFunc = function(req, res, next) {
    res.locals.url = req.url;
    if (req.cookies.loginToken) {
        authApi.utils.authToken(req.cookies.loginToken, authApi.utils.getIPFromRequest(req), false).then(function(response) {
            res.locals.user = response;
            next();
        }).catch(function(message) {
            if (message.message === "Invalid Token")
                res.clearCookie("loginToken");
            else
                console.log(message.message);

            next();
        });
    }
    else {
        next();
    }
};

module.exports = authFunc;
