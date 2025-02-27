const Comment = require("../model/comment");
const Blog = require("../model/blog");
const Notification = require("../model/notification");
const RegularUser = require("../model/regularUser");

// Add a new comment
const saveComment = async (req, res) => {
    try {
        let user_id = req.user.userId;
        let { _id, comment, replying_to, blog_author } = req.body;

        let commentObj = {
            blog_id: _id, 
            blog_author, 
            comment, 
            commented_by: user_id,
        };

        if(replying_to){
            commentObj.parent = replying_to;
        }

        const savedComment = await new Comment(commentObj).save();  // Await comment save
        
        // Handle blog update
        await Blog.findOneAndUpdate(
            { _id },
            {
                $push: { "comments": savedComment._id },
                $inc: { "activity.commentCount": 1, "activity.total_parent_comments": replying_to ? 0 : 1 }
            }
        );

        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: savedComment._id,
        };

        if(replying_to) {
            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate({ _id: replying_to}, {$push: {children:savedComment._id }} )
            .then( replyingToCommentDoc => {notificationObj.notification_for = replyingToCommentDoc.commented_by})
        }

        await new Notification(notificationObj).save();  // Await notification save

        res.status(200).json({
            comment: savedComment.comment, 
            dateCommented: savedComment.dateCommented, 
            _id: savedComment._id, 
            user_id, 
            children: savedComment.children
        });

    } catch (e) {
        console.error(e);  // Log the error for debugging
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// const getComment = async (req, res) => {

//     let { blog_id, skip } = req.body;

//     let maxLimit = 5;

//     Comment.find({blog_id, isReply: false})
//     .populate("commented_by", "username fullname profilePicture")
//     .skip(skip)
//     .limit(maxLimit)
//     .sort({
//         'dateCommented': -1
//     })
//     .then(comment => {
//         return res.status(200).json(comment);
//     })
//     .catch(err => {
//         console.log(err.message);
//         return res.status(500).json({ error: err.message })
//     })

// }

const getComment = async (req, res) => {
    try {
        let { blog_id, skip } = req.body;
        let maxLimit = 5;

        let comments = await Comment.find({ blog_id, isReply: false })
            .populate("commented_by", "username fullName") // Only fetch username & fullname
            .skip(skip)
            .limit(maxLimit)
            .sort({ dateCommented: -1 });

        // Fetch profile pictures separately
        const userIds = comments.map(comment => comment.commented_by._id);
        const regularUsers = await RegularUser.find({ userId: { $in: userIds } }).select("userId profilePicture");

        // Create a mapping of userId -> profilePicture
        const profilePictureMap = {};
        regularUsers.forEach(user => {
            profilePictureMap[user.userId.toString()] = user.profilePicture;
        });

        // Attach profilePicture to each comment
        const updatedComments = comments.map(comment => ({
            ...comment.toObject(),
            commented_by: {
                ...comment.commented_by.toObject(),
                profilePicture: profilePictureMap[comment.commented_by._id.toString()] || null // Default to null if not found
            }
        }));

        return res.status(200).json(updatedComments);
    } catch (err) {
        console.error("Error fetching comments:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

const deleteComments = async (_id) => {
    try {
        const comment = await Comment.findOneAndDelete({ _id });

        if (!comment) {
            console.log("Comment not found");
            return;
        }

        if (comment.parent) {
            await Comment.findByIdAndUpdate(comment.parent, { $pull: { children: _id } });
            console.log("Comment deleted from parent");
        }

        // Delete associated notifications
        await Notification.findOneAndDelete({ comment: _id });
        await Notification.findOneAndDelete({ reply: _id });

        // Update blog's comment count
        await Blog.findByIdAndUpdate(comment.blog_id, {
            $pull: { comments: _id },
            $inc: { "activity.commentCount": -1, "activity.total_parent_comments": comment.parent ? 0 : -1 },
        });

        // Recursively delete child comments
        if (comment.children.length) {
            await Promise.all(comment.children.map(replies => deleteComments(replies)));
        }

    } catch (err) {
        console.log(err.message);
    }
};


const deleteComment = async (req, res) => {
    try {
        let user_id = req.user.userId;
        let { _id } = req.body;

        const comment = await Comment.findOne({ _id });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (user_id == comment.commented_by || user_id == comment.blog_author) {
            await deleteComments(_id);
            return res.status(200).json({ status: "done" });
        } else {
            return res.status(403).json({ error: "You cannot delete this comment" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};



module.exports = {
    saveComment,
    getComment,
    deleteComment,
};
