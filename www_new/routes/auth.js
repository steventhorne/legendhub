let express = require("express");
let authApi = require("./api/auth")
let router = express.Router();
let url = require("url");

var authFunc = function(req, res, next) {
    res.locals.url = url.parse(req.url);
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
