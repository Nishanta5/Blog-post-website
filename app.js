// Express
const express = require("express");
const app = express();

// Modules
require("dotenv").config();
const ejs = require("ejs");
const _ = require('lodash');

//Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Global Variables
const homeContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// .use/.set
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/img", express.static(__dirname + "public/img"));
app.set("views", "./views");
app.set("view engine", "ejs");

// Database
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database is connected");

  //Post Schema
  const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
  });
  const Post = mongoose.model("Post", postSchema);

  // Home Page
  app.get("/", (req, res) => {
    Post.find(function(err, posts) {
      res.render("home", {
      homeContent: homeContent,
      posts: posts,
      _: _
      });
    });  
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

  // Publish Post
  app.post("/compose", (req, res) => {
    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postContent
    });
    
    post.save(function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  });

  // Routing
  app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({_id: requestedPostId}, function(err, post) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    });
  });

  //////////

});




// Listen on port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
  console.log(`Server is running on ${port}.`);
});
