const express = require("express");
const {
    findAll,
    save,
    findById,
    deleteById,
    update,
} = require("../controller/post_controller");
const postValidation = require("../validation/post_validation");

const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the directory exists or create it
const uploadFolder = path.join(__dirname, '../postPictures'); // Relative path to your project root

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true }); // Create the folder if it doesn't exist
}

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, uploadFolder); // Set destination to postPictures folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage });

// Routes
router.get("/", findAll); // Get all posts
router.post("/", postValidation, upload.single('file'), save); // Create a new post (uploading a post image)
router.get("/:id", findById); // Get a post by ID
router.delete("/:id", deleteById); // Delete a post by ID
router.put("/:id", postValidation, upload.single('file'), update); // Update a post (with optional file upload)

module.exports = router;
