const User = require("../model/user");
const Role = require("../model/role");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken")
const RegularUser = require("../model/regularUser");
const nanoid = require("nanoid");
const { getAuth } = require("firebase-admin/auth");

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


const save = async (req, res) => {
    try {
        const { fullName, email, password, roleName } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // If no roleName is provided, use "regularUser" as the default
        const role = await Role.findOne({ roleName: roleName || "regularUser" });
        if (!role) {
            return res.status(400).json({ message: "Invalid role name" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const username = await generateUsername(email);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            username: username, 
            roleId: role._id,
        });

        await newUser.save();

        // Automatically create RegularUser profiles if they don't exist
        const existingRegularUser = await RegularUser.findOne({ userId: newUser._id });
        if (!existingRegularUser) {
            await RegularUser.create({ userId: newUser._id });
        }

        // Find all regular users and populate their details
        const usersWithRole = await User.find({ roleId: "677158fc2375232531ced234" }); // Use actual roleId
        const regularUsers = await RegularUser.find().populate("userId", "fullName email username");

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: newUser,
            regularUsers 
        });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameNotUnique = await User.exists({username: username}).then((result) => result)

    isUsernameNotUnique ? username += nanoid() : "";

    return username;
}


// Login API
const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.send({
            success: false,
            message: "Please enter all the fields."
        })
    }

    try {
        // Find the user by email and populate the roleId
        const user = await User.findOne({ email:email }).populate('roleId');
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT token with user details and role
        const token = jwt.sign(
            { userId: user._id, role: user.roleId ? user.roleId.roleName : 'regularUser' },
            process.env.SECRET_KEY,
            { expiresIn: "90d" }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            username: user.username,
        });
    } catch (e) {
        console.error("Login error:", e.message);  // Log error details
        res.status(500).json({ message: "Server error", error: e.message });
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
        const { roleName, password, ...updateData } = req.body;

        // If roleName is provided, fetch the roleId
        if (roleName) {
            const role = await Role.findOne({ roleName });
            if (!role) {
                return res.status(400).json({ message: "Invalid role name" });
            }
            updateData.roleId = role._id;
        }

        // Hash the password if it's being updated
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
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
    login,
    findById,
    deleteById,
    update,
    findUserByRoleId
};
