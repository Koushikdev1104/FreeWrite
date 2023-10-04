const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    description: String,
    author: mongoose.Schema.Types.ObjectId,
    favouritesCount: {type: Number, default: 0},
    category: {type: String, default: ""},
    comments: [{type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Comment'}],
    tags: [{type: String, default: []}]
}, {timestamps:  true});

module.exports = mongoose.model("Post", PostSchema);
