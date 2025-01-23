const express = require("express");
const { save, findByPostId, deleteById } = require("../controller/like_controller");
const router = express.Router();
const likeValidation = require("../validation/like_validation");

// Route to like a post
router.post("/", likeValidation, save);

// Route to get all likes for a specific post
router.get("/:postId", findByPostId);

// Route to unlike a post
router.delete("/", deleteById);

module.exports = router;
