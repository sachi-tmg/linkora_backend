const express = require("express");
const {
    findAll,
    save,
    getAll,
    findTrending,
    countRoute,
    countSearchRoute,
    searchInBlogs,
    getFullBlog,
    uploadImage,
    verifyJWT,
    likeBlog,
    isLiked,
    notificationsAvailability,
    gettingNotifications,
    notificationCount,
    userBlog,
    countUserBlog,
    deletingBlog,
} = require("../controller/blog_controller");
const uploads = require("../middleware/uploadBanner");

const router = express.Router();

router.post("/latest-blogs", findAll); 
router.get("/get-all-blogs", getAll);
router.post("/all-latest-blogs-count", countRoute);
router.post("/create-blog", verifyJWT, uploads, save);
router.get("/trending-blogs", findTrending);
router.post("/search-blogs", searchInBlogs);
router.post("/search-blogs-count", countSearchRoute);
router.post("/blog-view", getFullBlog);
router.post("/uploadBanner", uploads, uploadImage);
router.post("/like-blog", verifyJWT,likeBlog);
router.post("/is-liked-by-user", verifyJWT,isLiked);
router.get("/new-notification", verifyJWT,notificationsAvailability);
router.post("/notifications", verifyJWT,gettingNotifications);
router.post("/all-notifications-count", verifyJWT,notificationCount);
router.post("/user-written-blogs", verifyJWT,userBlog);
router.post("/user-written-blogs-count", verifyJWT,countUserBlog);
router.post("/delete-blog", verifyJWT,deletingBlog);

module.exports = router;