const User = require("../model/user");
const Role = require("../model/role");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken")
const RegularUser = require("../model/regularUser");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

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
        // const usersWithRole = await User.find({ roleId: "67c3ba812308ac3b1d72f309" }); // Use actual roleId
        const regularUsers = await RegularUser.find().populate("userId", "fullName email username");

        const transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port: 587,
            secure: false,
            protocol:"smtp",
            auth:{
                user: "sachitamang43210@gmail.com",
                pass: "vplmqrmlmexiltrs"  
            }
        })  

        
        const info = await transporter.sendMail({
            from: "sachitamang43210@gmail.com",
            to: newUser.email, 
            subject: 'Welcome to Linkora!',
            html: `
            <h1>Registration Completed!!</h1>
            <p>Hello ${newUser.fullName},\n\nThank you for registering at Linkora. Your account has been successfully created.</p>
            `
        });

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

    isUsernameNotUnique ? username += uuidv4() : "";

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
        const user = await User.findOne({ email:email }).populate('roleId').exec();
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const regularUser = await RegularUser.findOne({ userId: user._id });

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if it's the user's first login
        if (!user.loggedInOnce) {
            user.loggedInOnce = true; 
            await user.save();
        }


        // Create JWT token with user details and role
        const token = jwt.sign(
            { userId: user._id, role: user.roleId ? user.roleId.roleName : 'regularUser' },
            process.env.SECRET_KEY,
            { expiresIn: "90d" }
        );

        const profilePicture = regularUser ? regularUser.profilePicture : null;

        res.status(200).json({
            message: "Login successful",
            token: token,
            username: user.username,
            profilePicture: profilePicture,
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

const changingPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Find the user by ID
        const user = await User.findOne({ _id: req.user.userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare the current password with the stored one
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(403).json({ error: "Incorrect current password" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ error: "Failed to update password" });
        }

        return res.status(200).json({ status: 'Password changed successfully' });

    } catch (err) {
        console.error("Error in changing password:", err);
        return res.status(500).json({ error: "Some error occurred while changing the password, please try again" });
    }
};


module.exports = {
    findAll,
    save,
    login,
    findById,
    deleteById,
    update,
    findUserByRoleId,
    changingPassword,
    generateUsername,
};
