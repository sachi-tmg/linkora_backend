const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "roles", 
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now, 
    },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
