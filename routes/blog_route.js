const express = require("express");
const {
    findAll,
    save,
    findTrending,
    countRoute,
    countSearchRoute,
    findByTag,
    deleteById,
    update,
    uploadImage,
    verifyJWT,
} = require("../controller/blog_controller");
const blogValidation = require("../validation/blog_validation");
const uploads = require("../middleware/uploadBanner");

const router = express.Router();

router.post("/latest-blogs", findAll); // Get all blogs
router.post("/all-latest-blogs-count", countRoute);
router.post("/create-blog", verifyJWT, uploads, blogValidation, save); // Create a new blog (uploading a blog image)
router.get("/trending-blogs", findTrending);
router.post("/search-blogs", findByTag);
router.post("/search-blogs-count", countSearchRoute);
router.delete("/:id", deleteById); // Delete a blog by ID
router.put("/:id", blogValidation, uploads, update); // Update a blog (with optional file upload)
router.post("/uploadBanner", uploads, uploadImage);

module.exports = router;


// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure the directory exists or create it
// const uploadFolder = path.join(__dirname, '../blogPictures'); // Relative path to your project root

// if (!fs.existsSync(uploadFolder)) {
//     fs.mkdirSync(uploadFolder, { recursive: true }); // Create the folder if it doesn't exist
// }

// // Set up Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, res, cb) {
//         cb(null, uploadFolder); // Set destination to blogPictures folder
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use the original file name
//     }
// });

// const upload = multer({ storage });

// Routes
