const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // References the users collection
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts", // References the posts collection
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    dateCommented: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;
