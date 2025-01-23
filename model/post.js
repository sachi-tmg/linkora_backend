const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    postPicture: {
        type: String, // Filename of the uploaded image (optional)
        default: null,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateUpdated: {
        type: Date,
        default: Date.now,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
});

const Post = mongoose.model("posts", postSchema);

module.exports = Post;
