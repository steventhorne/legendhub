let express = require("express");
let authApi = require("./api/auth");
let apiUtils = require("./api/utils");
let url = require("url");

var authFunc = async function(req, res, next) {
    res.locals.url = url.parse(req.url);
    res.locals.version = process.env.npm_package_version;
    res.locals.cookies = req.cookies;

    res.locals.displayDateTime = function(date) {
        let offset = res.locals.cookies.tzoffset;
        if (offset) {
            let displayDate = new Date(date);
            offset -= displayDate.getTimezoneOffset();
            displayDate.setMinutes(displayDate.getMinutes() + offset*(-1));
            return displayDate.toISOString().slice(0, 16).replace("T", " ");
        }
        else {
            return new Date(date).toISOString().slice(0, 16).replace("T", " ") + " UTC";
        }
    };

    if (req.cookies.loginToken) {
        try {
            res.locals.user = await authApi.utils.authToken(req.cookies.loginToken, authApi.utils.getIPFromRequest(req), false);
        }
        catch (e) {
            if (e.message === "Invalid Token") {
                res.clearCookie("loginToken");
                delete res.locals.cookies.loginToken;
                return next();
            }
            else {
                return next(e);
            }
        }

        try {
            let query = `
            {
                getNotifications(authToken:"${req.cookies.loginToken}",read:false) {
                    results {
                        createdOn
                        message
                        link
                    }
                }
            }
            `;
            let response = await apiUtils.postAsync({
                url: `http://localhost:${process.env.PORT}/api`,
                form: {
                    query
                }
            });
            res.locals.user.notifications = response.getNotifications.results;
        }
        catch (e) {
            return next(e);
        }

        next();
    }
    else {
        next();
    }
};

module.exports = authFunc;
