const mongoose = require("mongoose");
const router = require("express").Router();

const CommentModel = require("../models/Comment");
const UserModel = require("../models/User");
const PostModel = require("../models/Post");

// CUSTOM MIDDLEWARE

const commentsArray = [];

const isAuthenticated = function(req, res, next){
    if(!!req.user){
        next();
    }else{
        res.send({message: "User Not Authenticated", errors: 1, authenticated: false, error: "User Not Authenticated"});
    }
}

async function recursiveTraversal(comments=[], step=0){

    // console.log(step, comments);
    // console.log(step, comments);

    if(comments.length === 0){
        return ;
    }

    if(step > 3){
        step = 3;
    }

    const query = CommentModel.where("_id").in(comments);

    const results = await query.exec();

    if(typeof results !== 'undefined'){
        for(let i = 0; i < results.length; i++){
            console.log(results[i]._id, results[i].replies);
            commentsArray.push({step: step, comment: results[i]});
            await recursiveTraversal(results[i].replies, step+1);
        }
    }

    return;
}


// GET

router.get("/:postId",async function(req, res){
    const postId = req.params.postId;
    commentsArray.splice(0, commentsArray.length);


    PostModel.findOne({_id: postId}, function(err, result){
        if(err){
            console.error(err);
            res.send({message: "There was an error retireving comments for this post.", errors: 0, error: err, result: result});
        }else{
            if(typeof result.comments !== 'undefined'){
                recursiveTraversal(result.comments)
                .then((result) => {
                    res.send({message: "Comments Retrieved Successfully", errors: 0, error: "", result: commentsArray});
                }).catch(err => {
                    console.error(err);
                    res.send({message: "There was an error while retireving comments for this post.", errors: 0, error: err, result: result});
                });
            }else{
                res.send({message: "There was an error retireving comments for this post.", errors: 0, error: err, result: result});
            } 
        }
    });

});

// POST

router.post("/new", isAuthenticated, function(req, res, next){

    const data = req.body;

    const comment = new CommentModel({
        authorName: req.user.name,
        authorId: req.user.id,
        parentAuthorName: data.parentAuthorName,
        text: data.text
    });

    res.locals.commentId = comment.id;

    comment.save(function(err, result){
        if(err){
            console.error(err);
            res.send({message: "There was an error saving the coment", errors: 1, error: err, result: result});
        }else{
            next();
        }
    });
}, function(req, res){

    const postId = req.body.postId;


    PostModel.findOne({_id: postId}, function(err, result){
        if(err){
            console.error(err);
            res.send({message: "There was an error saving the coment", errors: 1, error: err, result: result});
        }else{
            const post = result;
            post.comments.push(res.locals.commentId);
            post.save(function(err, result){
                if(err){
                    console.error(err);
                    res.send({message: "There was an error saving the coment", errors: 1, error: err, result: result});
                }else{
                    res.send({message: "Comment successfully saved!", errors: 0, error: "", result: result});
                }
            });
        }
    })
});

router.post("/reply", isAuthenticated, function(req, res, next){
    
    const data = req.body;

    const comment = new CommentModel({
        authorName: req.user.name,
        authorId: req.user.id,
        parentAuthorName: data.parentAuthorName,
        text: data.text
    });

    comment.save(function(err, result){
        if(err){
            console.error(err);
            res.send({message: "There was an error saving the comment", errors: 1, error: err, result: result});
        }else{
            res.locals.commentId = comment.id;
            next();
            // res.send({message: "Comment successfully saved!", errors: 0, error: "", result: result});
        }
    });
}, function(req, res){
    const data = req.body;
    const commentId = res.locals.commentId;

    CommentModel.findOne({_id: data.parentCommentId}, function(err, comment, result){
        const replies = comment.replies;
        replies.push(commentId);
        comment.replies = replies;
        comment.save(function(err, result){
            if(err){
                res.send({message: "There was an error saving the comment", errors: 1, error: err, result: result});
            }else{
                res.send({message: "Comment successfully saved!", errors: 0, error: "", result: result});
            }
        });
    });
});


// PATCH



// DELETE



module.exports = router;
