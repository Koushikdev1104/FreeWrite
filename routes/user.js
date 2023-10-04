const mongoose = require("mongoose");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const UserModel = require("../models/User");

// Custom Middleware

const isAuthenticated = function(req, res, next){
    if(!!req.user){
        next();
    }else{
        res.send({message: "User Not Authenticated", errors: 1, authenticated: false, error: "User Not Authenticated"});
    }
}

// GET

router.get("/user", isAuthenticated, (req, res) => {

    res.send({user: req.user, message: "User retrieved successfully", errors: 0, authenticated: true, error: ""});
});


// get a particular user's info
router.get("/user/:id", function(req, res){
    
    const id = req.params.id;

    if(typeof id !== "undefined"){
        UserModel.findOne({_id: req.params.id}, function(err, user){
            if(err){
                console.log(err);
                res.send({user: user, message: "Error occured while retireving user", errors: 1,  error: err});
            }else {
                const formattedUser = {
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    bio: user.bio,
                    followers: user.followers,
                    following: user.following
                }
                res.send({user: formattedUser, message: "User retrieved successfully", errors: 0,  error: ""});
            }
        });
    }else {
        res.send({message: "user id is undefined", errors: 1, error: "User id is undefined"});
    }

    
});



// POST

router.post("/register", function(req, res){

    const data = req.body;
    const query = UserModel.findOne().or([{username: data.username}, {email: data.email}]);

    query.exec(async function(err, user) {
        if(err) throw err;
        if(user) res.send({message: "User with that particular username/email already exists! Please choose other username.", errors: 1, userCreated: false})
        if(!user){
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = new UserModel({
                name: data.name,
                email: data.email,
                username: data.username,
                password: hashedPassword,
                bio: !!data.bio ? data.bio : ""
            });

            user.save(function (err){
                if(err){
                    console.error(err);
                    res.send({message: "User Not Registered", errors: 1, userCreated: false, error: err});
                }else {
                    res.send({message: "User saved successfully", errors: 0, userCreated: true, error: ""});
                }
            });
        }
    });

});


router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send({message: "There was an error while signing in! Check your username and password.", errors: 1, error: "User not found", authenticated: false});
    else {
      req.login(user, (err) => {
        if (err) throw err;
        res.send({message: "User logged in  successfully", errors: 0, authenticated: true, error: "", user: user});
      });
    }
  })(req, res, next);
});

router.post("/logout", function(req, res){
    req.logout();

    if(!req.user){
        res.send({message: "User logged out successfully!", errors: 0, error: "", authenticated: false});
    }else{
        res.send({message: "There was an error logging out!", errors: 1, error: "Error", authenticated: true});
    }
})

// PATCH

// Add a follower
router.patch("/follow/:authorid", isAuthenticated,

function(req, res, next){
    const currentUserId = req.user.id;
    const authorUserId = req.params.authorid;
    if(currentUserId != authorUserId){
        UserModel.findOne({_id: currentUserId}, function(err, curUser, result){
            if(err){
                console.error(err);
                res.send({result: result, message: "Error occured while retrieving the current user", errors: 1, error: err});
            }else {
                const following = curUser.following;
                if(!following.includes(authorUserId)){
                    curUser.following.push(authorUserId);
                    curUser.save(function(err, result){
                        if(err){
                            console.error(err);
                            res.send({result: result, message: "Error occured while updating the current user", errors: 1, error: err});
                        }else{
                            console.log(`${currentUserId} following ${authorUserId}`);
                            next();
                        }
                    });
                }
            }
        });
    }else{
        res.send({result: "", message: "You cannot follow yourself!", errors: 1, error: ""});
    }
},
function(req, res){
    const currentUserId = req.user.id;
    const authorUserId = req.params.authorid;

    UserModel.findOne({_id: authorUserId}, function(err, user){
        if(err){
            console.error(err);
            res.send({user: user, message: "Error occured while retireving user", errors: 1,  error: err});
        }else {
            const followers = user.followers;
            if(!followers.includes(currentUserId)){
                user.followers.push(currentUserId);
                user.save(function(err, result){
                    if(err){
                        res.send({result: result, message: "Error occured while updating the author", errors: 1, error: err});
                    }
                    else{
                        console.log(`${currentUserId} is added as follower for ${authorUserId} successfully`);
                        res.send({result: result, message: "Following the author successfully", errors: 0, error: ""});
                    }
                });
            }
        }
    });
});

//Unfollw author {review and change the code}
router.patch("/unfollow/:authorid", isAuthenticated,

function(req, res, next){
    const currentUserId = req.user.id;
    const authorUserId = req.params.authorid;

    UserModel.findOne({_id: currentUserId}, function(err, curUser, result){
        if(err){
            console.error(err);
            res.send({result: result, message: "Error occured while retrieving the current user", errors: 1, error: err});
        }else {
            const following = curUser.following;
            const idx = following.indexOf(authorUserId);
            if(following.includes(authorUserId)){
                curUser.following.splice(idx, 1);
                curUser.save(function(err, result){
                    if(err){
                        console.error(err);
                        res.send({result: result, message: "Error occured while updating the current user", errors: 1, error: err});
                    }else{
                        console.log(`${currentUserId} unfollowed ${authorUserId}`);
                        next();
                    }
                });
            }
        }
    });

},
function(req, res){
    const currentUserId = req.user.id;
    const authorUserId = req.params.authorid;

    UserModel.findOne({_id: authorUserId}, function(err, user){
        if(err){
            console.error(err);
            res.send({user: user, message: "Error occured while retireving user", errors: 1,  error: err});
        }else {
            const followers = user.followers;
            const idx = followers.indexOf(currentUserId);
            if(followers.includes(currentUserId)){
                user.followers.splice(idx, 1);
                user.save(function(err, result){
                    if(err){
                        res.send({result: result, message: "Error occured while updating the author", errors: 1, error: err});
                    }
                    else{
                        console.log(`${currentUserId} is removed as follower for ${authorUserId} successfully`);
                        res.send({result: result, message: "Unfollowing the author successfully", errors: 0, error: ""});
                    }
                });
            }
        }
    });
});

// Update User
router.patch("/user/update/", isAuthenticated, function(req, res){
    const userId = req.user.id;
    const obj = req.body;


    UserModel.updateOne({_id: userId}, obj, function(err, writeOpResult){
        if(err){
            console.error(err);
            res.send({message: "Data updation resulted in failure", errors: 1, error: error, authenticated: true, updated: false});
        }else{
            res.send({message: "Updated data successfully", errors: 0, error: "", authenticated: true, updated: true});
        }
    });
});

// DELETE

router.delete("/user/:id", function(req, res){
    const userId = req.params.id;
    UserModel.deleteOne({_id: userId}, function(err, result){
        if(err){
            console.error(err);
            res.send({message: "Error while deleting user successfully", errors: 0, error: err});

        }else{
            res.send({message: "Deleted User successfully", errors: 0, error: ""});
        }
    });
});

module.exports = router;
module.exports.isAuthenticated = isAuthenticated;
