const express = require("express");
const { save, findByBlogId, deleteById } = require("../controller/like_controller");
const router = express.Router();
const likeValidation = require("../validation/like_validation");

// Route to like a blog
router.post("/", likeValidation, save);

// Route to get all likes for a specific blog
router.get("/:blogId", findByBlogId);

// Route to unlike a blog
router.delete("/", deleteById);

module.exports = router;
