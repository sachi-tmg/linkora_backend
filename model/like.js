const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
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
    dateLiked: {
        type: Date,
        default: Date.now,
    },
});

const Like = mongoose.model("likes", likeSchema);

module.exports = Like;
