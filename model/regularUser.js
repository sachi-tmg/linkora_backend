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
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

const RegularUser = mongoose.model("regularUsers", regularUserSchema);

module.exports = RegularUser;
