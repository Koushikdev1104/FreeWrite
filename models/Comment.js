const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    authorName: String,
    parentAuthorName: String,
    text: String,
    authroId: mongoose.Schema.Types.ObjectId,
    replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: []}]
}, {timestamps: true});

module.exports = mongoose.model("Comment", CommentSchema);