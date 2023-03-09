require("dotenv").config();

const migrations = require("./routes/api/migrations");
migrations.up();

const compression = require("compression");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const authRouter = require("./routes/auth");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const itemsRouter = require("./routes/items");
const mobsRouter = require("./routes/mobs");
const questsRouter = require("./routes/quests");
const wikiRouter = require("./routes/wiki");
const builderRouter = require("./routes/builder");
const changelogRouter = require("./routes/changelog");
const notificationsRouter = require("./routes/notifications");
const accountRouter = require("./routes/account");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("trust proxy", true);

// Setup logger
//winston.add(journald_transport.Journald);
//app.use(morgan("combined", { stream: winston.stream }));

// middleware for all requests
app.use(compression());
app.use(logger("dev"));//, { skip: function (req, res) {return res.statusCode < 400;} }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/// 404 items we know we don't have
// such as .map
app.use(function(req,res,next) {
    if (process.env.NODE_ENV === "production") {
        let url = require("url").parse(req.url);
        if (url.pathname.endsWith(".map"))
            return res.sendStatus(404);
    }

    return next();
});

// handle api requests
app.use("/api", apiRouter);

// middleware for non-api requests
app.use(cookieParser());

// auth request for views
app.use(authRouter);

// handle view routers
app.use("/", indexRouter);
app.use("/items", itemsRouter);
app.use("/mobs", mobsRouter);
app.use("/quests", questsRouter);
app.use("/wiki", wikiRouter);
app.use("/builder", builderRouter);
app.use("/changelog", changelogRouter);
app.use("/notifications", notificationsRouter);
app.use("/account", accountRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let error = new Error();
    error.status = 404;
    next(error);
});

// error handler
app.use(function(err, req, res, next) {
    if (err && (!err.status || err.status != 404))
        console.log(err);
    if (res.headersSent)
        return next(err);

    let errors = [];
    if (req.app.get("env") === "development")
        errors.push(err);

    // render the error page
    res.status(err.status || 500);
    res.render(`error/${err.status || 500}`, {error: err});
});

// fatal error if error pages cause errors.
app.use(function(err, req, res, next) {
    if (res.headersSent)
        return next(err);

    res.status(500);
    res.render("error/fatal");
});

app.listen(process.env.PORT, () => console.log(`Running app listening on port ${process.env.PORT}!`));
