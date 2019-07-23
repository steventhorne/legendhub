let express = require("express");
let router = express.Router();
let apiUtils = require("./api/utils");
let auth = require("./api/auth");

router.get(["/", "/index.html"], async function(req, res, next) {
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
    try {
        var data = await apiUtils.postAsync({
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: getChangelogQuery
            }
        });
    }
    catch (e) {
        next(e);
        return;
    }


    if (res.locals.user) {
        try {
            res.locals.user.permissions = await auth.utils.getPermissions(res.locals.user.memberId);
        }
        catch (e) {
            next(e);
            return;
        }
    }

    let vm = {
        query: req.query,
        results: data.getChangelogs.changelogs,
        moreResults: data.getChangelogs.moreResults,
        page: page,
        rows: rows,
        cookies: req.cookies
    };
    let title = "Changelog";
    res.render("changelog/index", {title, vm});
});

router.get(["/details.html"], async function(req, res, next) {
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

    try {
        var data = await apiUtils.postAsync({
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: query
            }
        });
    }
    catch (e) {
        next(e);
        return;
    }

    if (res.locals.user) {
        try {
            res.locals.user.permissions = await auth.utils.getPermissions(res.locals.user.memberId);
        }
        catch (e) {
            next(e);
            return;
        }
    }

    let changelog = data.getChangelogById;
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

    res.render("changelog/display", {title, vm});
});

router.get(["/edit.html"], async function(req, res, next) {
    if (res.locals.user) {
        try {
            let permissions = await auth.utils.getPermissions(res.locals.user.memberId);
            if (!permissions || !permissions.ChangelogVersion || !permissions.ChangelogVersion.update) {
                let error = new Error("You do not have permission to view this page.");
                error.status = 401;
                next(error);
                return;
            }
            res.locals.user.permissions = permissions;
        }
        catch (e) {
            next(e);
            return;
        }
    }
    else {
        let error = new Error("You must be logged in to view this page.");
        error.status = 401;
        next(error);
        return;
    }

    let query = `
    {
        getChangelogById(id:${req.query.id}) {
            id
            version
            notes
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync({
            url: `http://localhost:${process.env.PORT}/api`,
            form: {
                query: query
            }
        });
    }
    catch (e) {
        next(e);
        return;
    }

    let changelog = data.getChangelogById;
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

router.get(["/add.html"], async function(req, res, next) {
    if (res.locals.user) {
        try {
            let permissions = await auth.utils.getPermissions(res.locals.user.memberId);
            if (!permissions || !permissions.ChangelogVersion || !permissions.ChangelogVersion.update) {
                let error = new Error("You do not have permission to view this page.");
                error.status = 401;
                next(error);
                return;
            }
            res.locals.user.permissions = permissions;
        }
        catch (e) {
            next(e);
            return;
        }
    }
    else {
        let error = new Error("You must be logged in to view this page.");
        error.status = 401;
        next(error);
        return;
    }

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
});

module.exports = router;
