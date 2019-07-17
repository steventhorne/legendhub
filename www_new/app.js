require("dotenv").config();

let compression = require("compression");
let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");

let authRouter = require("./routes/auth");

let indexRouter = require("./routes/index");
let apiRouter = require("./routes/api");
let itemsRouter = require("./routes/items");
let mobsRouter = require("./routes/mobs");
let questsRouter = require("./routes/quests");
let wikiRouter = require("./routes/wiki");
let builderRouter = require("./routes/builder");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware for all requests
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// handle api requests
app.use("/api", apiRouter);

// middleware for non-api requests
app.use(cookieParser());

// 404 items we know we don't have
// such as .map and favicon files
app.use(function(req,res,next) {
    let url = require("url").parse(req.url);
    if (url.pathname.endsWith(".map") || url.pathname === "/favicon.ico")
        res.sendStatus(404);
    else
        next();
});

// auth request for views
app.use(authRouter);

// set version for views
app.use(function(req, res, next) {
    res.locals.version = process.env.npm_package_version;
    res.locals.cookies = req.cookies;
    next();
});

// handle view routers
app.use("/", indexRouter);
app.use("/items", itemsRouter);
app.use("/mobs", mobsRouter);
app.use("/quests", questsRouter);
app.use("/wiki", wikiRouter);
app.use("/builder", builderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    if (err)
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

app.listen(process.env.PORT, () => console.log(`Running app listening on port ${process.env.PORT}!`));
