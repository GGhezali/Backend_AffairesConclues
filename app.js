require("dotenv").config();
require("./models/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var articlesRouter = require("./routes/articles");
var categoriesRouter = require("./routes/categories");
var mesEncheresRouter = require("./routes/mes-encheres");
var etatsRouter = require("./routes/etats");
var auteursRouter = require("./routes/auteurs");
var editeursRouter = require("./routes/editeurs");
const fileUpload = require("express-fileupload");

var app = express();
const cors = require("cors");
app.use(cors());

app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/articles", articlesRouter);
app.use("/categories", categoriesRouter);
app.use("/mes-encheres", mesEncheresRouter);
app.use("/etats", etatsRouter);
app.use("/auteurs", auteursRouter);
app.use("/editeurs", editeursRouter);

module.exports = app;
