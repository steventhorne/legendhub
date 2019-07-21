let express = require("express");
let router = express.Router();
let request = require("request");
let auth = require("./api/auth");

router.get(["/", "/index.html"], function(req, res, next) {
    let page = req.query.page === undefined ? 1 : Number(req.query.page);
    let rows = 20;
    let getChangelogQuery = `
    {
        getChangelogs(
        page:${page}
        rows:${rows}) {
            moreResults
            changelogs {
                id
                version
                notes
                createdOn
            }
        }
    }
    `;
    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: getChangelogQuery
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }

        let data = body.data;
        let vm = {
            query: req.query,
            results: data.getChangelogs.changelogs,
            moreResults: data.getChangelogs.moreResults,
            page: page,
            rows: rows,
            cookies: req.cookies
        };
        let title = "Changelog";
        if (res.locals.user) {
            auth.utils.getPermissions(res.locals.user.memberId).then(
                response => {
                    res.locals.user.permissions = response;
                    res.render("changelog/index", {title, vm});
                }
            )
        }
        else {
            res.render("changelog/index", {title, vm});
        }
    });
});

router.get(["/details.html"], function(req, res, next) {
    let query = `
    {
        getChangelogById(id:${req.query.id}) {
            id
            version
            notes
            createdOn
        }
    }
    `;

    request.post({
        url: `http://localhost:${process.env.PORT}/api`,
        form: {
            query: query
        }
    },
    function(error, response, body) {
        body = JSON.parse(body);
        if (body.errors) {
            let error = new Error(body.errors[0].message);
            error.status = body.errors[0].code;
            next(error);
            return;
        }



        let changelog = body.data.getChangelogById;
        let vm = {
            changelog
        };
        let title = `Version ${changelog.version}`;
        res.locals.breadcrumbs = [
            {
                "display": "Changelog",
                "href": "/changelog/",
            },
            {
                "display": title,
                "active": true
            }
        ];

        if (res.locals.user) {
            auth.utils.getPermissions(res.locals.user.memberId).then(
                response => {
                    res.locals.user.permissions = response;
                    res.render("changelog/display", {title, vm});
                }
            )
        }
        else {
            res.render("changelog/display", {title, vm});
        }
    });
});

router.get(["/edit.html"], function(req, res, next) {
    if (res.locals.user) {
        auth.utils.getPermissions(res.locals.user.memberId).then(
            response => {
                if (response.ChangelogVersion.update) {
                    let query = `
                    {
                        getChangelogById(id:${req.query.id}) {
                            id
                            version
                            notes
                        }
                    }
                    `;

                    request.post({
                        url: `http://localhost:${process.env.PORT}/api`,
                        form: {
                            query: query
                        }
                    },
                    function(error, response, body) {
                        body = JSON.parse(body);
                        if (body.errors) {
                            let error = new Error(body.errors[0].message);
                            error.status = body.errors[0].code;
                            next(error);
                            return;
                        }

                        let changelog = body.data.getChangelogById;
                        let vm = {
                            changelog
                        };
                        let title = `Edit Version ${changelog.version}`;
                        res.locals.breadcrumbs = [
                            {
                                display: "Changelog",
                                href: "/changelog/",
                            },
                            {
                                display: `Version ${changelog.version}`,
                                href: `/changelog/details.html?id=${changelog.id}`
                            },
                            {
                                display: "Edit",
                                active: true
                            }
                        ];
                        res.render("changelog/modify", {title, vm});
                    });
                }
                else {
                    let error = new Error("You do not have permission to view this page.");
                    error.status = 401;
                    next(error);
                    return;
                }
            }
        );
    }
    else {
        let error = new Error("You must be logged in to view this page.");
        error.status = 401;
        next(error);
        return;
    }
});

router.get(["/add.html"], function(req, res, next) {
    if (res.locals.user) {
        auth.utils.getPermissions(res.locals.user.memberId).then(
            response => {
                if (response.ChangelogVersion.create) {
                    let vm = {};
                    let title = "Add Changelog";
                    res.locals.breadcrumbs = [
                        {
                            display: "Changelog",
                            href: "/changelog/",
                        },
                        {
                            display: "Add",
                            active: true
                        }
                    ];
                    res.render("changelog/modify", {title, vm});
                }
                else {
                    let error = new Error("You do not have permission to view this page.");
                    error.status = 401;
                    next(error);
                    return;
                }
            }
        );
    }
    else {
        let error = new Error("You must be logged in to view this page.");
        error.status = 401;
        next(error);
        return;
    }
});

module.exports = router;
