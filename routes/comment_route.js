const express = require("express");
const { save, findByBlogId, deleteById } = require("../controller/comment_controller");
const router = express.Router();
const commentValidation = require("../validation/comment_validation");

// Add a comment
router.post("/", commentValidation, save);

// Get all comments for a specific blog
router.get("/:blogId", findByBlogId);

// Delete a comment
router.delete("/:id", deleteById);

module.exports = router;
