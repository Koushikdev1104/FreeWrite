const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    password: String,
    bio: String,
    hash: String,
    salt: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, default: [], ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, default: [], ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Post'}],
    favourites: [{ type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Post'}]
});


module.exports = mongoose.model("User", UserSchema);
