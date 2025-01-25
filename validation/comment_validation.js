const joi = require("joi");

const commentSchema = joi.object({
    userId: joi.string().required(),
    postId: joi.string().required(),
    content: joi.string().required(),
});

function commentValidation(req, res, next) {
    const { userId, postId, content } = req.body;
    const { error } = commentSchema.validate({ userId, postId, content });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
}

module.exports = commentValidation;
