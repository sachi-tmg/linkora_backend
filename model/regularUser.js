const mongoose = require("mongoose");

const regularUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String, 
        default: "defaultProfile.jpg",
    },
    bio: {
        type: String,
        default: "",
    },
    social_links: {
        youtube: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        facebook: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        github: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        }
    },
    account_info:{
        total_posts: {
            type: Number,
            default: 0
        },
        total_reads: {
            type: Number,
            default: 0
        },
    },
    google_auth: {
        type: Boolean,
        default: false
    },
    blogs: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'posts',
        default: [],
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

const RegularUser = mongoose.model("regularUsers", regularUserSchema);

module.exports = RegularUser;
