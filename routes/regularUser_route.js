const express = require("express");
const uploads = require("../middleware/uploadProfile");
const {
    findAll,
    save,
    findRegularUser,
    deleteById,
    update,
    uploadImage,
} = require("../controller/regularUser_controller");

const regularUserValidation = require("../validation/regularUser_validation");

const router = express.Router();

// Routes
router.get("/", findAll); // Get all regular users
router.post("/saveRegularUser", uploads, regularUserValidation, save); // Create a new regular user (uploading a profile image)
router.post("/search-users", findRegularUser); // Get a regular user by ID
router.delete("/:id", deleteById); // Delete a regular user by ID
router.put("/save", regularUserValidation, update);
router.post("/uploadImage", uploads, uploadImage); // Update a regular user (with optional file upload)

module.exports = router;
