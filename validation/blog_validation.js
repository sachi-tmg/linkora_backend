const Joi = require("joi");

const blogSchema = Joi.object({
    title: Joi.string().trim().min(5).max(100).required().messages({
        "string.empty": "Title cannot be empty",
        "string.min": "Title must be at least 5 characters",
        "string.max": "Title cannot exceed 100 characters",
        "any.required": "Title is required"
    }),
    des: Joi.string().trim().max(200).required().messages({
        "string.empty": "Description cannot be empty",
        "string.max": "Description cannot exceed 200 characters",
        "any.required": "Description is required"
    }),
    content: Joi.object({
        blocks: Joi.array().min(1).required().messages({
            "array.min": "Content blocks must have at least 1 section",
            "any.required": "Content blocks are required"
        })
    }).unknown(true).required().messages({
        "any.required": "Content is required"
    }),
    tags: Joi.array().items(
        Joi.string().trim().max(20).required()
    ).min(1).max(10).required().messages({
        "array.min": "At least one tag is required",
        "array.max": "You can add up to 10 tags",
        "string.max": "Each tag should not exceed 20 characters",
        "any.required": "Tags are required"
    }),
    blogPicture: Joi.string().trim().uri().optional().messages({
        "string.uri": "Invalid URL format for blog picture"
    }),
    draft: Joi.boolean().required().messages({
        "any.required": "Draft status is required"
    }),
});

const blogValidation = (req, res, next) => {
    const { error } = blogSchema.validate(req.body, { abortEarly: false });

    if (error) {
        console.log("Validation Errors:", error.details.map(err => err.message)); // Log errors
        return res.status(400).json({ 
            message: "Validation error", 
            errors: error.details.map(err => err.message) 
        });
    }

    next();
};


module.exports = blogValidation;
