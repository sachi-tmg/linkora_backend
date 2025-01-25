const joi = require("joi");

const postSchema = joi.object({
    title: joi.string().required(),
    content: joi.string().required(),
    postPhoto: joi.string().optional(), // Optional, if provided, should be a string (filename)
});

function postValidation(req, res, next) {
    const { title, content, postPhoto } = req.body;
    const { error } = postSchema.validate({ title, content, postPhoto });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
}

module.exports = postValidation;
