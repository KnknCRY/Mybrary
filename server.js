// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").parse();
// }

const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");

const indexRouter = require("./routes/index.js");
const authorRouter = require("./routes/authors.js");

app.set("view engine", "ejs");
app.set("views", "views");
app.set("layout", "layouts/layout");
app.use(expressLayout);
app.use(express.static("public"));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/mybrary", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.log("error"));
db.once("open", () => console.log("connected to mongoose"));

app.use("/", indexRouter);
app.use("/authors", authorRouter);

app.listen(process.env.PORT || 3000);
