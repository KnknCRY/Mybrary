if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');

const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const indexRouter = require("./routes/index.js");
const authorRouter = require("./routes/authors.js");
const bookRouter = require("./routes/books.js");

app.set("view engine", "ejs");
app.set("views", "views");
app.set("layout", "layouts/layout");
app.use(expressLayout);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));//req可得資料
app.use(methodOverride('_method'));

app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/mybrary", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.log("error"));
db.once("open", () => console.log("connected to mongoose"));


initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
);
const users = [];

// app.get('/', checkAuthenticated, (req, res) => {
//   res.send('hi');
// });

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
})

// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()){
//     return next();
//   }
//   res.redirect('/login');
// }

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}


app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

app.listen(process.env.PORT || 3000);

//module.exports = checkAuthenticated;
