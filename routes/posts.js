const mongoose = require("mongoose");
const router = require("express").Router();
const PostModel = require("../models/Post");
const UserModel = require("../models/User");
// const isAuthenticated = require("./user.js").isAuthenticated;

// Custom Middleware

const isAuthenticated = function(req, res, next){
    if(!!req.user){
        next();
    }else{
        res.send({message: "User Not Authenticated", errors: 1, authenticated: false, error: "User Not Authenticated"});
    }
}

const doesPostBelongToCurrentAuthor = function(req, res, next){
    const postId = req.params.id;

    const query = PostModel.findOne({_id: postId}).lean();
    query.exec(function(err, post){
        if(err){
            console.log(err);
            res.send({mesage: "Error retrieving a post with the given id.", errors: 1, error: err});
        }else{
            if(!!post.author && req.user.id == post.author){
                next();
            }else {
                res.send({message: "You don't have the permission to edit this post", errors: 1, error: "Access Denied."});
            }
        }
    });
}

// GET

router.get("/my-posts", isAuthenticated, function(req, res){
    const posts = !!req.user.posts ? req.user.posts : []
    const query = PostModel.where('_id').in(posts);
    query.exec(function(err, result){
        if(err){
            res.send({result: result, message: "Error occured while retireving the posts", errors: 1, error: err});
        }else {
            res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
        }
    });
});

router.get("/:id/", function(req, res){
    const query = PostModel.findOne({_id: req.params.id}).lean()
    query.exec(function(err, post){
        if(err){
            console.log(err);
            res.send({result: post, message: "Error occured while retirieving the post", errors: 1, error: err});
        }else{
            res.send({result: post, message: "Post Retrieved Successfully", errors: 0, error: ""});
        }
    });
});

router.get("/:id/edit", isAuthenticated, doesPostBelongToCurrentAuthor, function(req, res){
    const postId = req.params.id;
    // mongoose not retireving the post with aporopriate id
    const query = PostModel.findOne({_id: postId}).lean();
    query.exec(function(err, post){
        if(err){
            console.log(err);
            res.send({mesage: "Error retrieving a post with the given id.", errors: 1, error: err});
        }else{
            res.send({post: post, message: "Post data retrieved successfully.", errors: 0, error: ""});
        }
    });
});

router.get("/recent/:results", function(req, res){
    const results = req.params.results;
    const query = PostModel.find({}).sort("-createdAt").limit(parseInt(results));
    query.exec(function(err, result){
        if(err){
            res.send({result: result, message: "Error occured while retrieving the posts", errors: 1, error: err});
            console.log(err);
        }else{
            res.send({result: result, message: "Posts Retrived Successfully", errors: 0, error: ""});
        }
    });
});

// sort based on tags

router.get("/sort/recent/:page/tags/:tag", function(req, res){
    const tag = req.params.tag;
    const page = req.params.page;

    let query;

    if(tag === "post"){
        query = PostModel.find();
    }else{
        query = PostModel.find({tags: tag});
    }


    query.sort("-createdAt").skip((page-1)*12).limit(12).exec(function (err, result){
        if(err){
            res.send({result: result, message: "Error occured while retrieving the posts", errors: 1, error: err});
            console.log(err);
        }else{
            res.send({result: result, message: "Posts retrieved Successfully", errors: 0, error: ""});
        }
    });

});

router.get("/sort/popular/:page/tags/:tag", function(req, res){
    const tag = req.params.tag;
    const page = req.params.page;

    let query;

    if(tag === "post"){
        query = PostModel.find();
    }else{
        query = PostModel.find({tags: tag});
    }

    query.sort("-favouritesCount -createdAt").skip((page-1)*12).limit(12).exec(function (err, result){
        if(err){
            res.send({result: result, message: "Error occured while retireving the posts", errors: 1, error: err});
            console.log(err);
        }else {
            res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
        }
    });
})

// router.get("/sort/recent/:page", function(req, res){
//     const page = req.params.page;
//     const query = PostModel.find({}).sort("-createdAt").skip((page-1)*12).limit(12);
//     query.exec(function(err, result){
//         if(err){
//             res.send({result: result, message: "Error occured while retrieveing the posts", errors: 1, error: err});
//             console.log(err);
//         }else{
//             res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
//         }
//     });
// });

router.get("/sort/recent/:page/category/:category", function(req, res){
    const page = req.params.page;
    const category = req.params.category;
    let query;
    if(category === 'all'){
        query = PostModel.find({});
    }else{
        query = PostModel.find({category: category});
    }
    query.sort("-createdAt").skip((page-1)*12).limit(12).exec(function(err, result){
        if(err){
            res.send({result: result, message: "Error occured while retrieveing the posts", errors: 1, error: err});
            console.log(err);
        }else{
            res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
        }
    });
});

// router.get("/sort/popular/:page", function(req, res){
//     const page = req.params.page;
//     const query = PostModel.find({}).sort("-favouritesCount -createdAt").skip((page-1)*12).limit(12);
//     query.exec(function(err, result){
//         if(err){
//             res.send({result: result, message: "Error occured while retireving the posts", errors: 1, error: err});
//         }else {
//             res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
//         }
//     });
// });

router.get("/sort/popular/:page/category/:category", function(req, res){
    const page = req.params.page;
    const category = req.params.category;
    let query;
    if(category === 'all'){
        query = PostModel.find({});
    }else{
        query = PostModel.find({category: category});
    }
    query.sort("-favouritesCount -createdAt").skip((page-1)*12).limit(12).exec(function(err, result){
        if(err){
            res.send({result: result, message: "Error occured while retireving the posts", errors: 1, error: err});
        }else {
            res.send({result: result, message: "Posts Retrieved Successfully", errors: 0, error: ""});
        }
    });
});









// POST

// create new post
router.post("/create", isAuthenticated,  function(req, res, next){

    const data = req.body;

    const post = new PostModel({
        title: data.title,
        body: data.body,
        description: data.description,
        author: req.user.id,
        category: data.category,
        tags: data.tags
    });

    post.save(function(err){
        if(err){
            console.log(err);
            res.send({message: "Error Occured while saving the post", postCreated: false, errors: 1, error: err});
        }else{
            res.locals.id = post.id;
            next();
            // res.end(result);
        }
    });
}, function(req, res){

    const id = res.locals.id;

    UserModel.findOne({username: req.user.username}, async function(err, user){
        if(!err){
            posts = user.posts ? user.posts : []

            posts.push(id);
            user.posts = posts;
            user.save(function(err){
                if(!err){
                    res.send({message: "Post Successfully saved!", postCreated: true, errors: 0, error: ""});
                }else {
                    res.send({message: "Error Occured while saving the post", postCreated: false, errors: 1, error: err});
                }
            })
        }else{
            console.log(err);
            res.send({message: "Error Occured while saving the post", postCreated: false, errors: 1, error: err});
        }
    });

});


// following search is very elementary. Need to improve it.
router.post("/search/", function(req, res){

    const query = PostModel.find({})
    .where(req.body.name).equals(req.body.value);

    query.exec(function(err, result){
        if(err){
            console.log(err);
        }else{
            res.send(result);
        }
    });
});

// PATCH
router.patch("/:id/update", isAuthenticated, doesPostBelongToCurrentAuthor, function(req, res){
    const postId = req.params.id;

    PostModel.updateOne({_id: postId}, req.body, function(err, result){
        if(err){
            res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
            console.log(err);
        }else{

            res.send({message: "Successfully updated the post", errors: 0, error: "", isUpdated: true, result: result});
        }
    });
});


// like
router.patch("/:id/like", isAuthenticated,

    function(req, res, next){
        const postId = req.params.id;

        UserModel.findOne({username: req.user.username}, function(err, user){
            if(err){
                res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                console.log(err);
            }else{
                const favs = user.favourites;
                favs.push(postId);
                user.favourites = favs;
                user.save(function(err, result){
                    if(err){
                        res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                        console.log(err);
                    }else{
                        next();
                    }
                });

            }
        });
    }

 ,function(req, res){
    const postId = req.params.id;

    PostModel.findOne({_id: postId}, function(err, post){
        if(err){
            console.log(err);
        }else{
            post.favouritesCount += 1;
            post.save(function(err, result){
                if(err){
                    res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                    console.log(err);
                }else{
                    res.send({message: "Successfully updated the post", errors: 0, error: "", isUpdated: true, result: result});
                }
            });
        }
    });
});

//unlike
router.patch("/:id/unlike", isAuthenticated,

    function(req, res, next){
        const postId = req.params.id;

        UserModel.findOne({username: req.user.username}, function(err, user){
            if(err){
                res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                console.log(err);
            }else{
                const favs = user.favourites;
                const idx = favs.indexOf(postId);
                favs.splice(idx, 1);
                user.favourites = favs;
                user.save(function(err, result){
                    if(err){
                        res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                        console.log(err);
                    }else{
                        next();
                    }
                });

            }
        });
    }

 ,function(req, res){
    const postId = req.params.id;

    PostModel.findOne({_id: postId}, function(err, post){
        if(err){
            console.log(err);
        }else{
            post.favouritesCount -= 1;
            post.save(function(err, result){
                if(err){
                    res.send({message: "Error Occured while updating the post", errors: 1, error: err, isUpdated: false, result: result});
                    console.log(err);
                }else{
                    res.send({message: "Successfully updated the post", errors: 0, error: "", isUpdated: true, result: result});
                }
            });
        }
    });
});



// DELETE

router.delete("/:id/delete", isAuthenticated, doesPostBelongToCurrentAuthor, function(req, res){
    const postId = req.params.id;

    PostModel.deleteOne({_id: postId}, function(err, result){
        if(err){
            res.send({message: "Error deleting the post", errors: 1, error: err, result: result});
            console.log(err);
        }else{
            res.send({message: "Deleted Post Successfully", errors: 0, error: "", result: result});
        }
    });
});


module.exports = router;
