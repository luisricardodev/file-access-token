const path = require("path");
const express = require("express");
const helmet = require("helmet");
const accessController = require("./controllers/accessController");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const accessRoutes = require("./routes/accessRoutes");

const app = express();

app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  "/static",
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    extensions: false
  })
);

app.get("/", accessController.showHome);
app.use(accessRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
