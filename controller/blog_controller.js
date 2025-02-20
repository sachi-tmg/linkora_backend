const Blog = require("../model/blog");
const User = require("../model/user");
const RegularUser = require("../model/regularUser");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token == null) {
        return res.status(401).json({ error: "No access token" })
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err) {
            return res.status(403).json({ error: "Access token is invalid" })
        }

        req.user = user
        next()

        
    })
};


// Get all blogs with user details
const findAll = async (req, res) => {
    try {

        let { page } = req.body;

        let maxLimit = 5;

        // Fetch blogs and populate userId from users
        const blogs = await Blog.find({ draft: false })
            .populate({
                path: "userId",
                select: "fullName email username",
            })
            .sort({ "dateCreated": -1 })
            .select("blog_id title des blogPicture activity tags dateCreated userId -_id")
            .skip((page -1) * maxLimit)
            .limit(maxLimit);

        // Fetch profile pictures separately
        const blogData = await Promise.all(
            blogs.map(async (blog) => {
                const regularUser = await RegularUser.findOne({ userId: blog.userId._id }).select("profilePicture -_id");
                
                const blogObj = blog.toObject();
                if (blogObj.userId && blogObj.userId._id) {
                    delete blogObj.userId._id;
                }

                return {
                    ...blogObj,
                    profilePicture: regularUser ? regularUser.profilePicture : undefined
                };
            })
        );

        return res.status(200).json({ blogs: blogData });
    } catch (e) {
        return res.status(500).json({ message: "Server error", error: e.message });
    }
};

const countRoute = async (req, res) => {
    Blog.countDocuments({ draft:false })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
}

const countSearchRoute = async (req, res) => {
    try {
        let { tag } = req.body;

        let findQuery = { tags: tag, draft: false };

        Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
    })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }

} 

// Save a new blog
const save = async (req, res) => {
    try {
        let { title, des, blogPicture, content, tags, draft } = req.body;

        const userId = req.user.userId;

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        tags = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [];

        let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g,"-").trim() + '-' + uuidv4();

        const newBlog = new Blog({
            userId,
            blog_id,
            title,
            des,
            content,
            tags,
            blogPicture,
            draft: Boolean(draft),
        });

        console.log(newBlog)

        const savedBlog = await newBlog.save();

        let incrementVal = draft ? 0 : 1;
        
        await RegularUser.findOneAndUpdate(
            { userId }, 
            { 
                $inc : {"account_info.total_posts" : incrementVal}, 
                $push : {"blogs": savedBlog._id},
            },
        );
            return res.status(200).json({ id: savedBlog._id })
      

    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


// Get trending blogs with user details
const findTrending = async (req, res) => {
    try {
        let maxLimit = 5;

        // Fetch blogs and populate userId from users
        const blogs = await Blog.find({ draft: false })
            .populate({
                path: "userId",
                select: "fullName email username",
            })
            .sort({ "activity.total_read": -1, "activity.total_likes": -1, "dateCreated": -1 })
            .select("blog_id title dateCreated userId -_id")
            .limit(maxLimit);

        // Fetch profile pictures separately
        const blogData = await Promise.all(
            blogs.map(async (blog) => {
                const regularUser = await RegularUser.findOne({ userId: blog.userId._id }).select("profilePicture -_id");
                
                const blogObj = blog.toObject();
                if (blogObj.userId && blogObj.userId._id) {
                    delete blogObj.userId._id;
                }

                return {
                    ...blogObj,
                    profilePicture: regularUser ? regularUser.profilePicture : undefined
                };
            })
        );

        return res.status(200).json({ blogs: blogData });
    } catch (e) {
        return res.status(500).json({ message: "Server error", error: e.message });
    }
};


// Find a blog by ID
const findByTag = async (req, res) => {
    try {
        let { tag, page } = req.body;
        let findQuery = { tags: tag, draft: false };
        let maxLimit = 2;

        const blogs = await Blog.find(findQuery)
            .populate({
                path: "userId",
                select: "fullName email username",
            })
            .sort({"dateCreated": -1 })
            .select("blog_id title des blogPicture activity tags dateCreated userId -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);

        // Fetch profile pictures separately
        const blogData = await Promise.all(
            blogs.map(async (blog) => {
                const regularUser = await RegularUser.findOne({ userId: blog.userId._id }).select("profilePicture -_id");
                
                const blogObj = blog.toObject();
                if (blogObj.userId && blogObj.userId._id) {
                    delete blogObj.userId._id;
                }

                return {
                    ...blogObj,
                    profilePicture: regularUser ? regularUser.profilePicture : undefined
                };
            })
        );

        return res.status(200).json({ blogs: blogData });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Delete a blog by ID
const deleteById = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted successfully!" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Update a blog by ID
const update = async (req, res) => {
    try {
        const { title, des, content, draft } = req.body;
        const blogPicture = req.file ? req.file.originalname : undefined;

        const updateData = {
            title,
            des,
            content: Array.isArray(content) ? content : [content],
            draft,
            dateUpdated: Date.now(), // Update timestamp
        };

        if (blogPicture) {
            updateData.blogPicture = blogPicture;
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json(blog);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Handle Image Upload
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Please upload a file" });
    }

    res.status(200).json({
        success: true,
        filename: req.file.filename,
    });
    console.log(req.file.filename)
};
module.exports = {
    findAll,
    save,
    findTrending,
    countRoute,
    countSearchRoute,
    findByTag,
    deleteById,
    update,
    uploadImage,
    verifyJWT,
};
