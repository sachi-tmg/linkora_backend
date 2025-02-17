// const Blog = require("../model/blog");
// const User = require("../model/user");

// // Find all blogs with user details
// const findAll = async (req, res) => {
//     try {
//         const blogs = await Blog.find()
//             .populate("userId", "fullName email");
//         res.status(200).json(blogs);
//     } catch (e) {
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// // Save a new blog
// const save = async (req, res) => {
//     try {
//         const { userId, title, content } = req.body;
//         const blogPicture = req.file ? req.file.originalname : null; 

//         // Validate if the user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: "Invalid user ID" });
//         }

//         const newBlog = new Blog({
//             userId,
//             title,
//             content,
//             blogPicture,
//         });

//         await newBlog.save();
//         res.status(201).json(newBlog);
//     } catch (e) {
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// // Find a blog by ID
// const findById = async (req, res) => {
//     try {
//         const blog = await Blog.findById(req.params.id)
//             .populate("userId", "fullName email");
//         if (!blog) {
//             return res.status(404).json({ message: "Blog not found" });
//         }
//         res.status(200).json(blog);
//     } catch (e) {
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// // Delete a blog by ID
// const deleteById = async (req, res) => {
//     try {
//         const blog = await Blog.findByIdAndDelete(req.params.id);
//         if (!blog) {
//             return res.status(404).json({ message: "Blog not found" });
//         }
//         res.status(200).json({ message: "Blog deleted!" });
//     } catch (e) {
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// // Update a blog by ID
// const update = async (req, res) => {
//     try {
//         const { title, content } = req.body;
//         const blogPicture = req.file ? req.file.originalname : undefined;

//         // Update fields
//         const updateData = { title, content };
//         if (blogPicture) {
//             updateData.blogPicture = blogPicture; // If a new file is uploaded, update the blog picture
//         }

//         const blog = await Blog.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true }
//         );

//         if (!blog) {
//             return res.status(404).json({ message: "Blog not found" });
//         }

//         res.status(200).json(blog);
//     } catch (e) {
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// const uploadImage = async (req, res, next) => {
//     if (!req.file) {
//       return res.status(400).send({ message: "Please upload a file" });
//     }
//     res.status(200).json({
//       success: true,
//       data: req.file.filename,
//     });
//   };


// module.exports = {
//     findAll,
//     save,
//     findById,
//     deleteById,
//     update,
//     uploadImage,
// };


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
}

// Save a new blog
const save = async (req, res) => {
    try {
        let { title, des, content, tags, draft } = req.body;
        const blogPicture = req.file ? req.file.originalname : null; 

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


// Get all blogs with user details
const findAll = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("userId", "fullName email")
            .populate("comments");
        res.status(200).json(blogs);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


// Find a blog by ID
const findById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("userId", "fullName email")
            .populate("comments");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
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
        filename: `/Banners/${req.file.filename}`, // Send the file path for frontend use
    });
};
module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
    uploadImage,
    verifyJWT,
};
