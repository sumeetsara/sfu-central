const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dbConnection = require('./dbConnection')
const mongoose = dbConnection.mongoose
const app = express();
var session = require("express-session");
const cookie = require("cookie");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const http = require('http')
const server = http.createServer(app);
const socketio = require('socket.io')
const io = socketio(server);

const MongoStore = require('connect-mongo');
const chatRoutes = require('./routes/chatRoutes')


chatServer = require('./chatServer')(io)

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://admin-sumeet:test123@cluster0.qr0rd.mongodb.net/sfucentralDB',
      mongoOptions: dbConnection.advancedOptions // See below for details
    })
  })
);


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.static("public"));




const postSchema = {
  subForum: String,
  titleOfPost: String,
  bodyOfPost: String,
  userID: String,
  likes: Number,
  dislikes: Number,
  isStar: Boolean,
};

const courseSchema = {
  course: String,
  professor: String,
  term: String,
  posts: [postSchema],
};




app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

const User = require('./models/user'); // Model for the collection

const Post = mongoose.model("Post", postSchema);

const Course = mongoose.model("Course", courseSchema);

app.get("/", function (req, res) {
  res.render("auth");
});

app.post("/login", function (req, res) {
  
  const userEmail = req.body.email;
  const password = md5(req.body.password);
  User.findOne({ email: userEmail }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // If email found
        if (foundUser.password === password) {
          // If password matches with corresponding email
          req.session.userID = userEmail;
          req.session.save()
          res.redirect("/home");
        } else {
          // Incorrect Password
          res.redirect("/");
        }
      } else {
        // Email does not exist in database
        res.redirect("/");
      }
    }
  });
});

app.post("/register", function (req, res) {
  const newUser = new User({
    name: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password),
  });

  User.findOne({ email: req.body.email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // If an email already exists
        res.status(401).send('Email Already Exists');
      } else {
        newUser.save(function (err) {
          // Else insert new account to database
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
      }
    }
  });
});

app.get("/logout", function(req,res) {
  if(req.session.userID === undefined) {
    res.redirect("/");
  } else {
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        req.session = null;
        res.redirect("/");
      }
    });
  }
});

app.get("/home", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    Post.find({}, function (err, posts) {
      res.render("home", { posts: posts });
    });
  }
});

app.get("/addPost", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    res.render("addPost");
  }
});

app.post("/addPost", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    const post = new Post({
      subForum: req.body.subForum,
      titleOfPost: req.body.postTitle,
      bodyOfPost: req.body.postContent,
      userID: req.session.userID,
      likes: 0,
      dislikes: 0,
      isStar: false,
    });

    post.save(function (err) {
      if (!err) {
        res.redirect("/home");
      }
    });
  }
});

app.post("/like", function (req, res) {
  var obj = JSON.stringify(req.body);
  var id = "";
  for (var i = 0; i < obj.length; i++) {
    if (i >= 2) {
      if (obj[i + 1] != ":") {
        id += obj[i];
      } else if (obj[i + 1] == ":") {
        break;
      }
    }
  }

  Post.findOne({ _id: id }, function (err, post) {
    post.likes++;
    post.save(function (err) {
      if (!err) {
        res.redirect("/home");
      }
    });
  });
});

app.post("/dislike", function (req, res) {
  var obj = JSON.stringify(req.body);
  var id = "";
  for (var i = 0; i < obj.length; i++) {
    if (i >= 2) {
      if (obj[i + 1] != ":") {
        id += obj[i];
      } else if (obj[i + 1] == ":") {
        break;
      }
    }
  }

  Post.findOne({ _id: id }, function (err, post) {
    post.dislikes++;
    post.save(function (err) {
      if (!err) {
        res.redirect("/home");
      }
    });
  });
});

app.post("/star", function (req, res) {
  var obj = JSON.stringify(req.body);
  var id = "";
  for (var i = 0; i < obj.length; i++) {
    if (i >= 2) {
      if (obj[i + 1] != ":") {
        id += obj[i];
      } else if (obj[i + 1] == ":") {
        break;
      }
    }
  }

  Post.findOne({ _id: id }, function (err, post) {
    if (post.isStar === true) {
      post.isStar = false;
    } else {
      post.isStar = true;
    }
    post.save(function (err) {
      if (!err) {
        res.redirect("/home");
      }
    });
  });
});

app.get("/friends", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    User.findOne({ email: req.session.userID }, function (err, users) {
      res.render("friends", { friendsList: users.friendLists });
    });
  }
});

app.post("/friends", function(req,res) {
  console.log("ENTERED")
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    console.log(req.body)
    const newFriend = req.body.addFriend;

    User.updateOne(
      { email: req.session.userID },
      { $addToSet: { friendLists: [newFriend] } },
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      }
    );
    res.redirect("/friends");
  }
});

app.use(chatRoutes);

app.get("/courses", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    Course.find({}, function (err, courses) {
      res.render("courses", { courses: courses });
    });
  }
});

app.get("/addCourse", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    res.render("addCourse");
  }
});

app.post("/addCourse", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    const courseName = new Course({
      course: req.body.course,
      professor: req.body.professor,
      term: req.body.term,
    });

    courseName.save(function (err) {
      if (!err) {
        res.redirect("/courses");
      }
    });
  }
});

app.get("/courses/:courseName", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    const requestedCourseName = req.params.courseName;
    Course.findOne({ course: requestedCourseName }, function (err, course) {
      res.render("courseDiscussion", {
        courseTitle: course.course,
        posts: course.posts,
      });
    });
  }
});

app.post("/courses/courseDiscussion", function (req, res) {
  if (req.session.userID === undefined) {
    res.redirect("/");
  } else {
    const postContent = req.body.newPost;
    const courseName = req.body.newCourse;

    const newPost = new Post({
      bodyOfPost: postContent,
      userID: req.session.userID,
    });

    Course.findOne({ course: courseName }, function (err, course) {
      course.posts.push(newPost);
      course.save(function (err) {
        if (!err) {
          res.redirect("/courses/" + courseName);
        }
      });
    });
  }
});

app.get("/weather", function(req,res) {
  if(req.session.userID === undefined) {
    res.redirect("/");
  } else {
    res.render("weather");
  }
});

app.get("/aboutUs", function(req,res) {
  if(req.session.userID === undefined) {
    res.redirect("/");
  } else {
    res.render("aboutUs");
  }
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

server.listen(port, function () {
  console.log("Listening on successfully");
});

module.exports = server;
