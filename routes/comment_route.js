const express = require("express");
const { saveComment, getComment, deleteComment } = require("../controller/comment_controller");
const router = express.Router();
const {
    verifyJWT,
} = require("../controller/blog_controller");

router.post("/create-comment",verifyJWT, saveComment);
router.post("/get-blog-comments", getComment);
router.post("/delete-comment",verifyJWT, deleteComment);

module.exports = router;
