const RegularUser = require("../model/regularUser");
const User = require("../model/user");
const path = require("path");
const fs = require("fs");

// Find all regular users with user details
const findAll = async (req, res) => {
    try {
        // Find all users with roleId "677158fc2375232531ced234" (regularUser role)
        const usersWithRole = await User.find({ roleId: "677158fc2375232531ced234" });

        // Automatically create RegularUser profiles if they don't exist
        for (const user of usersWithRole) {
            const existingRegularUser = await RegularUser.findOne({ userId: user._id });
            if (!existingRegularUser) {
                await RegularUser.create({ userId: user._id });
            }
        }

        // Retrieve all regular users and populate user details
        const regularUsers = await RegularUser.find().populate("userId", "fullName email");
        res.status(200).json(regularUsers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Save a new regular user (Optional)
const save = async (req, res) => {
    try {
        const { userId, bio } = req.body;
        const profilePicture = req.file ? req.file.originalname : undefined;

        // Validate if the user exists and has the correct role
        const user = await User.findOne({ _id: userId, roleId: "677158fc2375232531ced234" });
        if (!user) {
            return res.status(400).json({ message: "Invalid user ID or role" });
        }

        // Check if a regular user profile already exists
        const existingRegularUser = await RegularUser.findOne({ userId });
        if (existingRegularUser) {
            return res.status(400).json({ message: "Regular user profile already exists" });
        }

        // Create and save the new regular user profile
        const newRegularUser = await RegularUser.create({ userId, profilePicture, bio });
        res.status(201).json(newRegularUser);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Find a regular user by ID
const findRegularUser = async (req, res) => {
    try {
        let { query } = req.body;

        // First, search for the username in the User schema
        const users = await User.find({ "username": new RegExp(query, 'i') })
            .limit(50)
            .select("fullName username");  // Select fullName and username from User schema

        // Now, fetch associated RegularUser data for the matched users
        const regularUsers = await RegularUser.find({ "userId": { $in: users.map(user => user._id) } })
            .select("profilePicture userId");

        // Map the RegularUser data and combine with User info
        const formattedUsers = regularUsers.map(regularUser => {
            const user = users.find(u => u._id.toString() === regularUser.userId.toString());
            return {
                fullName: user.fullName,
                username: user.username,
                profilePicture: regularUser.profilePicture
            };
        });

        return res.status(200).json({ users: formattedUsers });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


const findProfile = async (req, res) => {
    try {
        let { username } = req.body;

        // Find the user by username
        const user = await User.findOne({ username })
            .select("-password -google_auth -roleId -loggedInOnce -dateCreated");

        // Find the associated RegularUser data
        const regularUser = await RegularUser.findOne({ userId: user._id })
            .select("-blogs -_id");

        return res.status(200).json({ 
            user: {
                ...user.toObject(),
                regularUser: regularUser || null
            } 
        });

    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};



// Delete a regular user by ID
const deleteById = async (req, res) => {
    try {
        const regularUser = await RegularUser.findByIdAndDelete(req.params.id);
        if (!regularUser) {
            return res.status(404).json({ message: "Regular user not found" });
        }
        res.status(200).json({ message: "Regular user profile deleted!" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


const update = async (req, res) => { 
    console.log("Received Data:", req.body); // Debugging

    const { username, bio, profilePicture, social_links } = req.body;
    const userId = req.user.userId; // Get the userId from req.user

    try {
        // First, update the `User` collection for the username
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId }, // Use userId instead of req.user._id
            { $set: { username } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Then, update the `RegularUser` collection for bio, profilePicture, and social_links
        const updatedRegularUser = await RegularUser.findOneAndUpdate(
            { userId: userId }, // Match the userId of the logged-in user
            { 
                $set: { 
                    bio, 
                    profilePicture, 
                    "social_links.youtube": social_links.youtube,
                    "social_links.instagram": social_links.instagram,
                    "social_links.facebook": social_links.facebook,
                    "social_links.twitter": social_links.twitter,
                    "social_links.github": social_links.github,
                    "social_links.website": social_links.website
                } 
            },
            { new: true }
        );

        if (!updatedRegularUser) {
            return res.status(404).json({ message: "Regular user not found" });
        }

        res.json({ message: "Profile updated successfully", user: updatedRegularUser });
    } catch (error) {
        console.error("Error during update:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const uploadImage = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file" });
    }
    res.status(200).json({
      success: true,
      data: req.file.filename,
    });
  };


module.exports = {
    findAll,
    save,
    findRegularUser,
    findProfile,
    deleteById,
    update,
    uploadImage,
};
