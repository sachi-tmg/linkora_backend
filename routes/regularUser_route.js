const express = require("express");
const uploads = require("../middleware/uploadProfile");
const {
    findAll,
    save,
    findById,
    deleteById,
    update,
    uploadImage,
} = require("../controller/regularUser_controller");

const regularUserValidation = require("../validation/regularUser_validation");

const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure the directory exists or create it
// const uploadFolder = path.join(__dirname, 'public/regularUserImages');

// if (!fs.existsSync(uploadFolder)) {
//     fs.mkdirSync(uploadFolder, { recursive: true }); 
// }

// // Set up Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, res, cb) {
//         cb(null, uploadFolder); // Set destination to regularUserImages folder
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use the original file name
//     }
// });

// const upload = multer({ storage });

// Routes
router.get("/", findAll); // Get all regular users
router.post("/saveRegularUser", uploads, regularUserValidation, save); // Create a new regular user (uploading a profile image)
router.get("/:id", findById); // Get a regular user by ID
router.delete("/:id", deleteById); // Delete a regular user by ID
router.put("/save", regularUserValidation, update);
router.post("/uploadImage", uploads, uploadImage); // Update a regular user (with optional file upload)

module.exports = router;
