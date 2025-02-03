const joi = require("joi");
const User = require("../model/user");

// Regular user schema validation using Joi
const userSchema = joi.object({
    fullName: joi.string().min(3).required(),
    email: joi.string().email().required(),  
    password: joi.string().min(6).required(), 
});

async function userValidation(req, res, next) {
    const { error } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (user) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error!" });
    }
}

module.exports = userValidation;
