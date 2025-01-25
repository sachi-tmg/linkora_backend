const joi = require("joi");

// Regular user schema validation using Joi
const regularUserSchema = joi.object({
    userId: joi.string().length(24).hex().required().messages({
        'string.length': 'userId must be a valid MongoDB ObjectId',
        'string.hex': 'userId must be a valid MongoDB ObjectId',
    }),
    profilePicture: joi.string().allow("").optional(), 
    bio: joi.string().optional(),  
});

function regularUserValidation(req, res, next) {
    const { error } = regularUserSchema.validate(req.body);

    if (error) {
        // Return structured error message
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
}

module.exports = regularUserValidation;
