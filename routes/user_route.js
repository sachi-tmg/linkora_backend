const express = require("express");
const { 
    findAll, 
    save, 
    findById, 
    deleteById, 
    update, 
    findUserByRoleId,
    login,
    changingPassword,
} = require("../controller/user_controller");
const router = express.Router();
const userValidation = require("../validation/user_validation");
const {authenticateToken,authorizeRole} = require("../security/auth");
const { verifyJWT } = require("../controller/blog_controller");


router.get("/", authenticateToken, findAll);
router.post("/registerUser", userValidation, save);
router.post("/login", login);
router.post("/change-password", verifyJWT, changingPassword); 
router.get("/:id", findById);
router.delete("/:id",deleteById);
router.put("/:id",userValidation, update);
router.get("/role/:roleId", authenticateToken, authorizeRole(), findUserByRoleId);

module.exports = router;