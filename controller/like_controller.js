const Like = require("../model/like");
const Blog = require("../model/blog");

// Create a new like
const save = async (req, res) => {
    try {
        const { userId, blogId } = req.body;

        // Check if the like already exists
        const existingLike = await Like.findOne({ userId, blogId });
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this blog" });
        }

        const newLike = new Like({ userId, blogId });
        await newLike.save();

        // Increment the like count in the blog
        await Blog.findByIdAndUpdate(blogId, { $inc: { likeCount: 1 } });

        res.status(201).json(newLike);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Get all likes for a specific blog
const findByBlogId = async (req, res) => {
    try {
        const likes = await Like.find({ blogId: req.params.blogId }).populate("userId", "fullName email");
        res.status(200).json(likes);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Delete a like (unlike a blog)
const deleteById = async (req, res) => {
    try {
        const { userId, blogId } = req.body;

        const deletedLike = await Like.findOneAndDelete({ userId, blogId });
        if (!deletedLike) {
            return res.status(404).json({ message: "Like not found" });
        }

        // Decrement the like count in the blog
        await Blog.findByIdAndUpdate(blogId, { $inc: { likeCount: -1 } });

        res.status(200).json({ message: "Like removed" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    save,
    findByBlogId,
    deleteById,
};
