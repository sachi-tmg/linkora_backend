const Post = require("../model/post");
const User = require("../model/user");

// Find all posts with user details
const findAll = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("userId", "fullName email");
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Save a new post
const save = async (req, res) => {
    try {
        const { userId, title, content } = req.body;
        const postPicture = req.file ? req.file.originalname : null; // If file uploaded, use the filename

        // Validate if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const newPost = new Post({
            userId,
            title,
            content,
            postPicture,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Find a post by ID
const findById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("userId", "fullName email");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Delete a post by ID
const deleteById = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted!" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Update a post by ID
const update = async (req, res) => {
    try {
        const { title, content } = req.body;
        const postPicture = req.file ? req.file.originalname : undefined;

        // Update fields
        const updateData = { title, content };
        if (postPicture) {
            updateData.postPicture = postPicture; // If a new file is uploaded, update the post picture
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
};
