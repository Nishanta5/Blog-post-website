const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const methodOverride = require("method-override");

require("dotenv").config();

// .use/.set
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/img", express.static(__dirname + "/public/img"));
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Database
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const homeContent = "home content";

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
      console.log("Database is connected");

      const userSchema = new mongoose.Schema({
            username: String,
            password: String,
            role: {
                  type: String,
                  default: "user",
            },
      });

      userSchema.plugin(passportLocalMongoose);

      const User = mongoose.model("User", userSchema);

      const postSchema = new mongoose.Schema({
            title: {
                  type: String,
                  required: true,
            },
            content: {
                  type: String,
                  required: true,
            },
      });

      const Post = mongoose.model("Post", postSchema);

      passport.use(User.createStrategy());
      passport.serializeUser(User.serializeUser());
      passport.deserializeUser(User.deserializeUser());

      app.use(
            session({
                  secret: process.env.SESSION_SECRET,
                  resave: false,
                  saveUninitialized: false,
            })
      );

      app.use(passport.initialize());
      app.use(passport.session());

      // Home Page
      app.get("/", (req, res) => {
            if (req.isAuthenticated()) {
                  Post.find((err, posts) => {
                        if (err) {
                              console.error(err);
                              // Handle the error, e.g., render an error page or redirect
                        } else {
                              res.render("home", {
                                    homeContent: homeContent,
                                    posts: posts,
                                    _: _,
                              });
                        }
                  });
            } else {
                  res.redirect("/login");
            }
      });

      // Signup Page
      app.get("/signup", (req, res) => {
            res.render("signup");
      });

      // Handle Signup
      app.post("/signup", (req, res) => {
            User.register({ username: req.body.username }, req.body.password, (err, user) => {
                  if (err) {
                        console.error(err);
                        res.redirect("/signup");
                  } else {
                        passport.authenticate("local")(req, res, () => {
                              res.redirect("/");
                        });
                  }
            });
      });

      // Login Page
      app.get("/login", (req, res) => {
            res.render("login");
      });

      app.post(
            "/login",
            passport.authenticate("local", {
                  successRedirect: "/",
                  failureRedirect: "/login",
            })
      );

      // Logout
      app.get("/logout", (req, res) => {
            req.logout();
            res.redirect("/");
      });

      // About Page
      app.get("/about", (req, res) => {
            res.render("about", { aboutContent: aboutContent });
      });

      // Contact Page
      app.get("/contact", (req, res) => {
            res.render("contact", { contactContent: contactContent });
      });

      // Compose Page
      app.get("/compose", (req, res) => {
            res.render("compose");
      });

      app.post("/compose", (req, res) => {
            const post = new Post({
                  title: req.body.postTitle,
                  content: req.body.postContent,
            });

            post.save((err) => {
                  if (err) {
                        console.error(err);
                        // Handle the error, e.g., render an error page or redirect
                  } else {
                        res.redirect("/");
                  }
            });
      });

      // Routing
      app.get("/posts/:postId", (req, res) => {
            const requestedPostId = req.params.postId;

            Post.findOne({ _id: requestedPostId }, (err, post) => {
                  if (err) {
                        console.error(err);
                        // Handle the error, e.g., render an error page or redirect
                  } else {
                        res.render("post", {
                              title: post.title,
                              content: post.content,
                        });
                  }
            });
      });

      app.delete("/posts/:postId", (req, res) => {
            const postId = req.params.postId;

            if (req.isAuthenticated() && req.user.role === "admin") {
                  // Implement logic to delete the post from the database
                  Post.findByIdAndRemove(postId, (err) => {
                        if (err) {
                              console.error(err);
                              // Handle the error, e.g., render an error page or redirect
                        } else {
                              res.redirect("/");
                        }
                  });
            } else {
                  // If the user is not an admin, redirect or show an error
                  res.status(403).send("Permission Denied"); // 403 Forbidden
            }
      });

      // Listen on port
      const port = process.env.PORT || 8000;
      app.listen(port, () => {
            console.log(`Server is running on ${port}.`);
      });
});
