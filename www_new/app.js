#!/usr/bin/env node

let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
require("dotenv").config();

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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(authRouter);

app.use("/", indexRouter);
app.use("/api", apiRouter);
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
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err);
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error/404");
});

app.listen(process.env.PORT, () => console.log(`Running app listening on port ${process.env.PORT}!`));
