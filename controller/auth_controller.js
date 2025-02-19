require('dotenv').config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");


const SECRET_KEY = process.env.SECRET_KEY;

// Register API
const register = async (req, res) => {
    const { fullName, email, password, roleId } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            roleId // Assuming default is 'regularUser'
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

// Login API
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email }).populate('roleId');
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
            { userId: user._id, role: user.roleId.roleName },
            SECRET_KEY, 
            { expiresIn: "90d" }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = { register, login };
