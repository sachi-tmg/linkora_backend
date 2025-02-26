const Blog = require("../model/blog");
const User = require("../model/user");
const RegularUser = require("../model/regularUser");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const Notification = require("../model/notification");

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
        let { tag, query, userId } = req.body;
        let findQuery;

        if(tag){
            findQuery = { tags: tag, draft: false };
        } else if(query) {
            findQuery = { draft:false, title: new RegExp(query, 'i') }
        } else if(userId) {
            findQuery = {userId, draft: false}
        }

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
        let { title, des, blogPicture, content, tags, draft, id } = req.body;

        const userId = req.user.userId;

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        tags = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [];

        let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g,"-").trim() + '-' + uuidv4();

        if(id){

            Blog.findOneAndUpdate({ blog_id }, { title, des, blogPicture, content, tags, draft: draft ? draft : false })
            .then(blog => {
                return res.status(200).json({id: blog_id})
            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })

        } else {
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
        }

        
      

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


// Find a searching blogs
const searchInBlogs = async (req, res) => {
    try {
        let { tag, query, userId, page, eliminate_blog } = req.body;
        let findQuery;

        if(tag){
            findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
        } else if(query) {
            findQuery = { draft:false, title: new RegExp(query, 'i') }
        } else if(userId) {
            findQuery = {userId, draft: false}
        }

        let maxLimit = 5;

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

const getFullBlog = async (req, res) => {
    try {
        let { blog_id, draft, mode } = req.body;

        if (!blog_id) {
            return res.status(400).json({ message: "blog_id is required" });
        }

        let incrementVal = mode != 'edit' ? 1:0;

        let blog = await Blog.findOne({ blog_id })
            .populate({
                path: "userId",
                select: "fullName username",
            })
            .select("title des content blogPicture activity dateCreated blog_id tags userId");

        if (!blog) {
            return res.status(500).json({ message: "Blog not found" });
        }

        await Blog.updateOne({ blog_id }, { $inc: { "activity.total_reads": incrementVal } });

        const regularUser = await RegularUser.findOne({ userId: blog.userId._id }).select("profilePicture -_id");

        await RegularUser.findOneAndUpdate(
            { userId: blog.userId._id }, 
            { $inc: { "account_info.total_reads": incrementVal } },
            { new: true }  
        );

        const blogData = {
            ...blog.toObject(),
            profilePicture: regularUser ? regularUser.profilePicture : undefined
        };

        if (blogData.userId && blogData.userId._id) {
            delete blogData.userId._id;
        }

        if(blog.draft && !draft){
            return res.status(500).json({ error: 'you cannot access blog drafts data'})
        }

        return res.status(200).json({ blog: blogData });

    } catch (e) {
        console.error("Error fetching full blog:", e.message);
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


const likeBlog = async (req, res) => {
    try {
        let user_id = req.user.userId;
        let { _id, isLikedByUser } = req.body;

        let incrementVal = isLikedByUser ? -1 : 1;

        let blog = await Blog.findOneAndUpdate(
            { _id },
            { $inc: { "activity.likeCount": incrementVal } },
            { new: true } 
        );

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        if (!isLikedByUser) {
            let likeNotification = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.userId,
                user: user_id
            });

            await likeNotification.save();
            return res.status(200).json({ liked_by_user: true });
        } else {
            // Remove the like notification
            await Notification.findOneAndDelete({ 
                user: user_id, 
                type: "like", 
                blog: _id 
            });

            return res.status(200).json({ liked_by_user: false });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const isLiked = async (req, res) => {

    let user_id = req.user.userId;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
    .then(result => {
        return res.status(200).json({result})
    })
    .catch(err => {
        return res.status(500).json({ error: err.message})
    })
}



module.exports = {
    findAll,
    save,
    findTrending,
    countRoute,
    countSearchRoute,
    searchInBlogs,
    getFullBlog,
    uploadImage,
    verifyJWT,
    likeBlog,
    isLiked,
};
