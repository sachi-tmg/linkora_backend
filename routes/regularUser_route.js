const express = require("express");
const uploads = require("../middleware/uploadProfile");
const {
    findAll,
    save,
    findRegularUser,
    findProfile,
    deleteById,
    update,
    uploadImage,
} = require("../controller/regularUser_controller");

const regularUserValidation = require("../validation/regularUser_validation");

const router = express.Router();

// Routes
router.get("/", findAll);
router.post("/saveRegularUser", uploads, regularUserValidation, save);
router.post("/search-users", findRegularUser); 
router.post("/get-profile", findProfile);
router.delete("/:id", deleteById); 
router.put("/save", regularUserValidation, update);
router.post("/uploadImage", uploads, uploadImage); 

module.exports = router;
