const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const logger = require("morgan");
const cors = require("cors");

const api = require("./routes/api");
const util = require("./routes/util");
const config = require("./routes/config");

const app = express();

app.use(logger("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(session(config.session));

// if *.html, use auth functions.
// app.all(/[a-zA-Z0-9]+\.html/, util.checkCrendential);

app.use(express.static(path.join(__dirname, "page/dist")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "page/dist/index.html"));
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/html")));
app.use(express.static(path.join(__dirname, "public/html.js")));
app.use(express.static(path.join(__dirname, "public/static")));
app.use(express.static(path.join(__dirname, "node_modules")));

app.use("/api", api);

module.exports = app;
