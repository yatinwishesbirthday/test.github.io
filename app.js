require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("./src/Model/user");
const Post = require("./src/Model/post");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
var MemoryStore = require("memorystore")(session);
const passport = require("passport");
const flash = require("connect-flash");
require("./src/passportLocal")(passport);
require("./src/googleAuth")(passport);
const multer = require("multer");
const cloudinary = require("cloudinary");
const DatauriParser = require("datauri/parser");
const path = require("path");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log("Database connected"));
app.use(cookieParser(process.env.SECRET));
app.use(
    session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    next();
});

//define storage for images
const storage = multer.memoryStorage();



//upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
});
const parser = new DatauriParser();


//cloudinary
cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


//defining sorting criteria for profile page posts
function compare(a, b) {
    if (a.postedOn < b.postedOn) {
        return 1;
    }
    if (a.postedOn > b.postedOn) {
        return -1;
    }
    return 0;
}

//home page
app.get("/", (req, res) => {
    res.render("home", { req: req, removeDropdown: false });
});

app.get("/profile/:userId", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.params.userId;
        // get user
        if (userId === req.user.id) {
            const u = await User.findOne({ _id: userId });
            // wait to get user's all posts
            Promise.all(
                u.posts.map((postId) =>
                    Post.findOne({ _id: postId })
                        .exec()
                        .catch((err) => console.error)
                )
            )
                // passes fetched posts array
                .then((posts) =>
                    res.render("profile", {
                        posts: posts.sort(compare),
                        req: req,
                        removeDropdown: false,
                    })
                )
                .catch((err) => console.error);
        } else {
            res.redirect("/signup");
        }
    } else {
        res.redirect("/login");
    }
});
app.get("/compose", (req, res) => {
    if (req.isAuthenticated()) {
        res.set(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
        );
        res.render("compose", {
            user: req.user,
            req: req,
            api: process.env.TINY_API_KEY,
            removeDropdown: false,
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/compose", upload.single("image"), async(req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const checkedImg = req.body.image;
    let img = "/uploads/images/default.jpg";
    if(checkedImg)
    {
        img = "/uploads/images/"+checkedImg;
    }
    if (req.file) {
        const file = parser.format(
            path.extname(req.file.originalname).toString(),
            req.file.buffer
            ).content;
        const result = await cloudinary.v2.uploader.upload(file);
        img = result.secure_url;
    }
    const reactionMap = new Map();
    reactionMap.set("like", 0);
    reactionMap.set("funny", 0);
    reactionMap.set("sad", 0);
    reactionMap.set("angry", 0);
    User.findById(req.user.id, function (err, user) {
        if (err) console.log(err);
        if (user) {
            const newPost = new Post({
                title: title,
                author: user.id.toString(),
                content: content,
                img: img,
                reactions: reactionMap,
                reactedUser: new Map(),
                comments: [],
            });
            newPost.save(function (err) {
                if (err) console.log(err);
                else {
                    user.posts.push(newPost.id);
                    user.save(function () {
                        res.redirect("/secrets");
                    });
                }
            });
        }
    });
});

app.get("/posts/:postId", (req, res) => {
    const requestedPostId = req.params.postId;
    Post.findOne({ _id: requestedPostId }, function (err, post) {
        if (err) console.log(err);
        res.render("posts", {
            post: post,
            reqURL: "/posts/" + requestedPostId,
            req: req,
            removeDropdown: false,
        });
    });
});
app.post("/posts/:postId", (req, res) => {
    if (req.isAuthenticated()) {
        res.set(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
        );
        const requestedPostId = req.params.postId;
        const comment = req.body.comment;

        if (comment != "") {
            Post.findOne({ _id: requestedPostId }, function (err, post) {
                if (err) console.log(err);
                if (post) {
                    const obj = {
                        id: Math.round(Math.random() * 10000),
                        comment: comment,
                    };
                    Post.updateOne(
                        { _id: requestedPostId },
                        { $push: { comments: obj } },
                        function (err) {
                            if (err) console.log(err);
                            res.redirect("/posts/" + requestedPostId);
                        }
                    );
                }
            });
        } else {
            res.redirect("/posts/" + requestedPostId);
        }
    } else {
        res.redirect("/login");
    }
});
app.get("/posts/:postId/:emojiName", (req, res) => {
    if (req.isAuthenticated()) {
        const requestedPostId = req.params.postId;
        const requestedemoji = req.params.emojiName;
        Post.findOne({ _id: requestedPostId }, function (err, post) {
            if (err) console.log(err);
            if (post) {
                const postRxn = post.reactions;
                const userReactedMap = post.reactedUser;
                if (userReactedMap.has(req.user.id)) {
                    const userCurrentEmoji = userReactedMap.get(req.user.id);
                    postRxn.set(
                        userCurrentEmoji,
                        postRxn.get(userCurrentEmoji) - 1
                    );
                    userReactedMap.delete(req.user.id);
                    if (userCurrentEmoji != requestedemoji) {
                        postRxn.set(
                            requestedemoji,
                            postRxn.get(requestedemoji) + 1
                        );
                        userReactedMap.set(req.user.id, requestedemoji);
                    }
                } else {
                    postRxn.set(
                        requestedemoji,
                        postRxn.get(requestedemoji) + 1
                    );
                    userReactedMap.set(req.user.id, requestedemoji);
                }
                Post.updateOne(
                    { _id: requestedPostId },
                    {
                        $set: {
                            reactions: postRxn,
                            reactedUser: userReactedMap,
                        },
                    },
                    function (err) {
                        if (err) console.log(err);
                        res.redirect("/posts/" + requestedPostId);
                    }
                );
            }
        });
    } else {
        res.redirect("/signup");
    }
});

app.get("/edit/:postId", (req, res) => {
    if (req.isAuthenticated()) {
        const requestedPostId = req.params.postId;
        Post.findOne({ _id: requestedPostId }, function (err, post) {
            if (err) console.log(err);
            if (post) {
                res.render("edit", {
                    title: post.title,
                    content: post.content,
                    reqURL: "/edit/" + requestedPostId,
                    req: req,
                    api: process.env.TINY_API_KEY,
                    removeDropdown: false,
                });
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.post("/edit/:postId", (req, res) => {
    const requestedPostId = req.params.postId;
    Post.findOneAndUpdate(
        {
            _id: requestedPostId, // Query Part
        },
        {
            $set: {
                title: req.body.title, // Fields which we need to update
                content: req.body.content,
                edited: true,
            },
        },
        {
            new: true, // option part ( new: true will provide you updated data in response )
        },
        (err, post) => {
            if (!err) {
                res.redirect("/posts/" + requestedPostId);
            }
        }
    );
});
app.get("/delete/:postId/:commentid", (req, res) => {
    const postId = req.params.postId;
    const deletecmntid = parseInt(req.params.commentid);
    Post.findOneAndUpdate(
        { _id: postId },
        {
            $pull: {
                comments: {
                    id: deletecmntid,
                },
            },
        },
        function (err) {
            if (err) console.log(err);
            else {
                res.redirect("/posts/" + postId);
            }
        }
    );
});

app.post("/delete/:postId", (req, res) => {
    const postId = req.params.postId;

    User.findOneAndUpdate(
        { _id: req.user.id },
        {
            $pull: {
                posts: postId,
            },
        },
        function (err) {
            if (err) console.log(err);
        }
    );
    Post.findOneAndDelete({ _id: postId }, function (err, post) {
        if (err) console.log(err);
        else {
            res.redirect("/profile/" + req.user.id);
        }
    });
});
app.get("/signup", (req, res) => {
    res.render("signup", {
        err: null,
        email: null,
        req: req,
        removeDropdown: true,
        login: false,
    });
});
app.post("/signup", (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
        //check whether fields are empty
        res.render("signup", {
            err: "All fields required!",
            email: email,
            req: req,
            removeDropdown: true,
            login: false,
        });
    } else if (password != confirmPassword) {
        //check whether passwords match
        res.render("signup", {
            err: "Passwords don't match!",
            email: email,
            req: req,
            removeDropdown: true,
            login: false,
        });
    } else {
        //check if user already exist
        User.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (data) {
                res.render("signup", {
                    err: "User Exists, Try Logging In!",
                    email: email,
                    req: req,
                    removeDropdown: true,
                    login: false,
                });
            } else {
                //generate the salt
                bcrypt.genSalt(12, (err, salt) => {
                    if (err) throw err;
                    //hash the password
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;

                        const user = new User({
                            email: email,
                            password: hash,
                            googleId: null,
                            provider: "email",
                        });
                        user.save((err, data) => {
                            if (err) throw err;
                            res.redirect("/login");
                        });
                    });
                });

                //save user in db
                //login the user
            }
        });
    }
});
app.get("/login", (req, res) => {
    res.render("login", {
        err: null,
        email: null,
        req: req,
        removeDropdown: true,
        login: true,
    });
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        failureRedirect: "/login",
        successRedirect: "/secrets",
        failureFlash: true,
    })(req, res, next);
});

app.get("/secrets", async (req, res) => {
    let posts = await Post.find().sort({ postedOn: "desc" });
    res.render("secrets", { posts: posts, req: req, removeDropdown: false });
});

app.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/secrets");
    }
);

app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        res.redirect("/");
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, (req, res) => {
    console.log("app is runnning on sever 3000");
});
