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
        const profilePicture = req.file ? req.file.originalname : "defaultProfile.jpg";

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
const findById = async (req, res) => {
    try {
        const regularUser = await RegularUser.findById(req.params.id).populate("userId", "fullName email");
        if (!regularUser) {
            return res.status(404).json({ message: "Regular user not found" });
        }
        res.status(200).json(regularUser);
    } catch (e) {
        console.error(e);
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

// Update a regular user by ID

// const update = async (req, res) => {
//     try {
//         const regularUser = await RegularUser.findById(req.params.id);
//         if (!regularUser) {
//             return res.status(404).json({ message: "Regular user not found" });
//         }

//         // Extract the userId from the found RegularUser document
//         const userId = regularUser.userId;

//         // Prepare update data for RegularUser
//         const updateData = {};

//         // If a profile picture is provided in the form-data, save it as well
//         if (req.file) {
//             const newProfilePicture = `IMG${userId.toString().slice(-5)}.jpg`;
//             const newPath = path.join(req.file.destination, newProfilePicture);

//             // Rename and assign the new file name
//             const oldPath = req.file.path;
//             fs.renameSync(oldPath, newPath);
//             updateData.profilePicture = newProfilePicture;
//         }

//         // Update RegularUser fields (bio, profilePicture)
//         const { bio } = req.body;
//         if (bio) updateData.bio = bio;

//         // Now update the RegularUser document
//         const updatedRegularUser = await RegularUser.findByIdAndUpdate(req.params.id, updateData, { new: true });
//         if (!updatedRegularUser) {
//             return res.status(404).json({ message: "RegularUser update failed" });
//         }

//         // Return the updated RegularUser
//         res.status(200).json(updatedRegularUser);
//     } catch (e) {
//         console.error(e); // Log the error for debugging purposes
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };


const update = async (req, res) => {
    try {
        // Extract userId from the request body
        const { userId } = req.body;

        // Find the RegularUser by userId
        const regularUser = await RegularUser.findOne({ userId: userId });
        if (!regularUser) {
            return res.status(404).json({ message: "Regular user not found" });
        }

        // Prepare update data for RegularUser
        const updateData = {};

        // If a profile picture is provided in the form-data, save it as well
        // if (req.file) {
        //     const newProfilePicture = `IMG${userId.toString().slice(-5)}.jpg`;
        //     const newPath = path.join(req.file.destination, newProfilePicture);

        //     // Rename and assign the new file name
        //     const oldPath = req.file.path;
        //     fs.renameSync(oldPath, newPath);
        //     updateData.profilePicture = newProfilePicture;
        // }
        const { profilePicture } = req.body;
        if (profilePicture) updateData.profilePicture = profilePicture;

        // Update RegularUser fields (bio, profilePicture)
        const { bio } = req.body;
        if (bio) updateData.bio = bio;

        // Now update the RegularUser document
        const updatedRegularUser = await RegularUser.findOneAndUpdate({ userId: userId }, updateData, { new: true });
        if (!updatedRegularUser) {
            return res.status(404).json({ message: "RegularUser update failed" });
        }

        // Return the updated RegularUser
        res.status(200).json(updatedRegularUser);
    } catch (e) {
        console.error(e); // Log the error for debugging purposes
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


// const update = async (req, res) => {
//     try {
//         const { bio } = req.body;
//         const regularUser = await RegularUser.findById(req.params.id);

//         if (!regularUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (bio) {
//             regularUser.bio = bio;
//         }

//         await regularUser.save();
//         res.status(200).json(regularUser);
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };

// // 📌 Upload Profile Picture
// const uploadProfilePicture = async (req, res) => {
//     try {
//         const regularUser = await RegularUser.findById(req.params.id);
//         if (!regularUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (req.file) {
//             const newProfilePicture = `IMG${regularUser.userId.toString().slice(-5)}.jpg`;
//             const newPath = path.join(req.file.destination, newProfilePicture);

//             // Rename uploaded file
//             fs.renameSync(req.file.path, newPath);
//             regularUser.profilePicture = newProfilePicture;

//             await regularUser.save();
//             res.status(200).json({ message: "Profile picture updated", profilePicture: newProfilePicture });
//         } else {
//             res.status(400).json({ message: "No file uploaded" });
//         }
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ message: "Server error", error: e.message });
//     }
// };


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
    findById,
    deleteById,
    update,
    uploadImage,
};
