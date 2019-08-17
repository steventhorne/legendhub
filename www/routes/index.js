let router = require("express").Router();
let auth = require("./api/auth");
let request = require("request");
let mysql = require("./api/mysql-connection");

router.get(["/", "/index.html"], function(req, res, next) {
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
});

router.all(["/feedback.html"], function(req, res, next) {
    const feedbackTitle = req.body.feedbackTitle;
    const feedbackBody = req.body.feedbackBody;
    const recaptcha = req.body["g-recaptcha-response"];

    let vm = {};
    if (req.method === "POST") {
        if (recaptcha) {
            request.post({
                url: "https://www.google.com/recaptcha/api/siteverify",
                json: true,
                form: {
                    secret: process.env.RECAPTCHA_SECRET,
                    response: recaptcha
                }
            }, function(error, response, body) {
                if (error)
                    return next(error);

                if (body.success) {
                    if (feedbackTitle) {
                        let query = `mutation {createIssue(input:{repositoryId:"""${process.env.GITHUB_REPOSITORY}""",title:"""${feedbackTitle}"""${feedbackBody?`,body:"""${feedbackBody}"""`:""}}) {issue {url}}}`;
                        let options = {
                            url: "https://api.github.com/graphql",
                            headers: {
                                "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
                                "User-Agent": "LegendHUB"
                            },
                            json: true,
                            body: {query}
                        };

                        request.post(options, function(error, response, body) {
                            if (error)
                                return next(error);

                            body = body.data;
                            if (body.errors) {
                                return next(new Error(body.errors[0].message));
                            }
                            else {
                                vm.type = "success";
                                vm.url = body.createIssue.issue.url;
                                return res.render("feedback", {title:"Feedback Sent", vm});
                            }
                        })
                    }
                    else {
                        vm.type = "error";
                        vm.message = "All required fields must be filled out.";
                        vm.values = {title: feedbackTitle, body: feedbackBody};
                        return res.render("feedback", {title: "Feedback Error", vm});
                    }
                }
                else {
                    vm.type = "error";
                    vm.message = "Invalid reCAPTCHA.";
                    vm.values = {title: feedbackTitle, body: feedbackBody};
                    return res.render("feedback", {title: "Feedback Error", vm});
                }
                return;
            });
        }
        else {
            vm.type = "error";
            vm.message = "The reCAPTCHA must be filled out.";
            vm.values = {title: feedbackTitle, body: feedbackBody};
            res.render("feedback", {title: "Feedback Error", vm});
        }
    }
    else {
        vm.type = "normal";
        vm.values = {title: "", body: ""};
        res.render("feedback", {title: "Send Feedback", vm});
    }
});

//router.all(["/play.html"], function(req, res, next) {
    //res.render("play", {title: "Play LegendMUD"});
//});

let getSitemapQuery = function(table) {
    return new Promise(function(resolve, reject) {
        mysql.query(`SELECT Id, ModifiedOn FROM ${table}`,
            [],
            function(error, results, fields) {
                if (error)
                    return reject(new Error(error.sqlMessage));

                resolve(results);
            });
    });
};

router.get(["/sitemap.xml"], async function(req, res, next) {
    res.type("application/xml");

    let sitemapMainText = [];
    sitemapMainText.push(`<url><loc>https://www.legendhub.org/index.html</loc></url>`);
    sitemapMainText.push(`<url><loc>https://www.legendhub.org/login.html</loc></url>`);
    sitemapMainText.push(`<url><loc>https://www.legendhub.org/cookies.html</loc></url>`);

    try {
        var sitemapItems = await getSitemapQuery("Items");
        var sitemapMobs = await getSitemapQuery("Mobs");
        var sitemapQuests = await getSitemapQuery("Quests");
        var sitemapWikiPages = await getSitemapQuery("WikiPages");
    }
    catch (e) {
        return next(e);
    }

    let sitemapItemsText = [];
    for (let i = 0; i < sitemapItems.length; ++i) {
        sitemapItemsText.push(`<url><loc>https://www.legendhub.org/items/details.html?id=${sitemapItems[i].Id}</loc><lastmod>${sitemapItems[i].ModifiedOn.toISOString()}</lastmod></url>`);
    }

    let sitemapMobsText = [];
    for (let i = 0; i < sitemapMobs.length; ++i) {
        sitemapMobsText.push(`<url><loc>https://www.legendhub.org/mobs/details.html?id=${sitemapMobs[i].Id}</loc><lastmod>${sitemapMobs[i].ModifiedOn.toISOString()}</lastmod></url>`);
    }

    let sitemapQuestsText = [];
    for (let i = 0; i < sitemapQuests.length; ++i) {
        sitemapQuestsText.push(`<url><loc>https://www.legendhub.org/quests/details.html?id=${sitemapQuests[i].Id}</loc><lastmod>${sitemapQuests[i].ModifiedOn.toISOString()}</lastmod></url>`);
    }

    let sitemapWikiPagesText = [];
    for (let i = 0; i < sitemapWikiPages.length; ++i) {
        sitemapWikiPagesText.push(`<url><loc>https://www.legendhub.org/wiki/details.html?id=${sitemapWikiPages[i].Id}</loc><lastmod>${sitemapWikiPages[i].ModifiedOn.toISOString()}</lastmod></url>`);
    }

    let sitemapText = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">${sitemapMainText.join("")}${sitemapItemsText.join("")}${sitemapMobsText.join("")}${sitemapQuestsText.join("")}${sitemapWikiPagesText.join("")}</urlset>`;

    res.send(sitemapText);
});

module.exports = router;
