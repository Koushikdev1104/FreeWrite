const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path")
require('dotenv').config()


const app = express();

const url = process.env.MONGODB_URI;

mongoose.connect(url,  () => {console.log("mongoose is connected");});


//Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("models"));
app.use(express.static("routes"));

app.use(express.static(path.join(__dirname, "client", "build")))


app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./routes/auth.helper.js")(passport);


// Users

app.use("/api/users", require("./routes/user"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));


// End of Middleware



// app.get("/", function(req, res){
//     res.send("Server can be accessed");
// });



app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const port = process.env.PORT || 4000;


app.listen(port, (req, res) => {
    console.log(`Server Started on port ${port}`);
});
