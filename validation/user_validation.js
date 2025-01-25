const joi = require("joi");
const User = require("../model/user"); // Assuming you're using Mongoose for user model

// Regular user schema validation using Joi
const userSchema = joi.object({
    fullName: joi.string().min(3).required(),
    email: joi.string().email().required(),  // Added email format validation
    password: joi.string().min(6).required(), // Added password length validation
});

async function userValidation(req, res, next) {
    const { error } = userSchema.validate(req.body);

    // Check for validation errors
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the email already exists in the database
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (user) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // Proceed to the next middleware if validation passes and email is unique
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error!" });
    }
}

module.exports = userValidation;
