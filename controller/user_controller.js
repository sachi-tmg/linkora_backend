const User = require("../model/user");
const Role = require("../model/role");

// Find all users with role details
const findAll = async (req, res) => {
    try {
        const users = await User.find().populate("roleId", "roleName");
        res.status(200).json(users);
    } catch (e) {
        console.error(e);  // Log the error to the console
        res.status(500).json({ message: "Server error", error: e.message });
    }
};


// Save a new user with role
const save = async (req, res) => {
    try {
        const { fullName, email, password, roleName } = req.body;

        // If no roleName is provided, use "regularUser" as the default
        const role = await Role.findOne({ roleName: roleName || "regularUser" });
        if (!role) {
            return res.status(400).json({ message: "Invalid role name" });
        }

        const newUser = new User({
            fullName,
            email,
            password, // Ensure this is hashed if not already done
            roleId: role._id,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (e) {
        res.status(500).json(e);
    }
};


// Find a user by ID with role details
const findById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("roleId", "roleName");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json(e);
    }
};

// Delete a user by ID
const deleteById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted!" });
    } catch (e) {
        res.status(500).json(e);
    }
};

// Update a user by ID
const update = async (req, res) => {
    try {
        const { roleName, ...updateData } = req.body;

        // If roleName is provided, fetch the roleId
        if (roleName) {
            const role = await Role.findOne({ roleName });
            if (!role) {
                return res.status(400).json({ message: "Invalid role name" });
            }
            updateData.roleId = role._id;
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (e) {
        res.status(500).json(e);
    }
};

const findUserByRoleId = async (req, res) => {
    try {
        // Extract roleId from query parameters (or from the request body if needed)
        const { roleId } = req.params;

        // Find users with the provided roleId
        const users = await User.find({ roleId }).populate("roleId", "roleName");

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found with this role" });
        }

        res.status(200).json(users);
    } catch (e) {
        console.error(e);  // Log the error to the console
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
    findUserByRoleId
};
