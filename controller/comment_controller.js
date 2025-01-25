const Comment = require("../model/comment");
const Post = require("../model/post");

// Add a new comment
const save = async (req, res) => {
    try {
        const { userId, postId, content } = req.body;

        const newComment = new Comment({ userId, postId, content });
        await newComment.save();

        // Increment the comment count in the post
        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

        res.status(201).json(newComment);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Get all comments for a specific post
const findByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate("userId", "fullName email")
            .sort({ dateCommented: -1 }); // Latest comments first
        res.status(200).json(comments);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Delete a comment
const deleteById = async (req, res) => {
    try {
        const commentId = req.params.id;

        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Decrement the comment count in the post
        await Post.findByIdAndUpdate(deletedComment.postId, { $inc: { commentCount: -1 } });

        res.status(200).json({ message: "Comment deleted" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    save,
    findByPostId,
    deleteById,
};
