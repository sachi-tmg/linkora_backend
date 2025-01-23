const express = require("express");
const {
    findAll,
    save,
    findById,
    deleteById,
    update,
} = require("../controller/regularUser_controller");

const regularUserValidation = require("../validation/regularUser_validation");

const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the directory exists or create it
const uploadFolder = path.join(__dirname, '../regularUserImages'); // Relative path to your project root

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true }); // Create the folder if it doesn't exist
}

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, uploadFolder); // Set destination to regularUserImages folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage });

// Routes
router.get("/", findAll); // Get all regular users
router.post("/", upload.single('file'), regularUserValidation, save); // Create a new regular user (uploading a profile image)
router.get("/:id", findById); // Get a regular user by ID
router.delete("/:id", deleteById); // Delete a regular user by ID
router.put("/:id", upload.single('file'), regularUserValidation, update); // Update a regular user (with optional file upload)

module.exports = router;
