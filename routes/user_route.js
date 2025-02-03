const express = require("express");
const { 
    findAll, 
    save, 
    findById, 
    deleteById, 
    update, 
    findUserByRoleId,
    login
} = require("../controller/user_controller");
const router = express.Router();
const userValidation = require("../validation/user_validation");
const {authenticateToken,authorizeRole} = require("../security/auth")


router.get("/", authenticateToken, findAll);
router.post("/registerUser", userValidation, save);
router.post("/login", login);
router.get("/:id", findById);
router.delete("/:id",deleteById);
router.put("/:id",userValidation, update);
router.get("/role/:roleId", authenticateToken, authorizeRole(), findUserByRoleId);

module.exports = router;