const Like = require("../model/like");
const Post = require("../model/post");

// Create a new like
const save = async (req, res) => {
    try {
        const { userId, postId } = req.body;

        // Check if the like already exists
        const existingLike = await Like.findOne({ userId, postId });
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this post" });
        }

        const newLike = new Like({ userId, postId });
        await newLike.save();

        // Increment the like count in the post
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

        res.status(201).json(newLike);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Get all likes for a specific post
const findByPostId = async (req, res) => {
    try {
        const likes = await Like.find({ postId: req.params.postId }).populate("userId", "fullName email");
        res.status(200).json(likes);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Delete a like (unlike a post)
const deleteById = async (req, res) => {
    try {
        const { userId, postId } = req.body;

        const deletedLike = await Like.findOneAndDelete({ userId, postId });
        if (!deletedLike) {
            return res.status(404).json({ message: "Like not found" });
        }

        // Decrement the like count in the post
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });

        res.status(200).json({ message: "Like removed" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    save,
    findByPostId,
    deleteById,
};
