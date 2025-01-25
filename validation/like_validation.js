const joi = require("joi");

const likeSchema = joi.object({
    userId: joi.string().required(),
    postId: joi.string().required(),
});

function likeValidation(req, res, next) {
    const { userId, postId } = req.body;
    const { error } = likeSchema.validate({ userId, postId });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
}

module.exports = likeValidation;
