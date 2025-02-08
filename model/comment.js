const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: true,
    },
    blog_author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'blogs',
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
