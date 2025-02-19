const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // References the users collection
        required: true,
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogs", // References the blogs collection
        required: true,
    },
    dateLiked: {
        type: Date,
        default: Date.now,
    },
});

const Like = mongoose.model("likes", likeSchema);

module.exports = Like;
