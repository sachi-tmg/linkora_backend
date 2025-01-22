const express = require("express");
const { 
    findAll, 
    save, 
    findById, 
    deleteById, 
    update, 
    findUserByRoleId
} = require("../controller/user_controller");
const router = express.Router();
const {authenticateToken,authorizeRole} = require("../security/auth")


router.get("/", authenticateToken, authorizeRole(["superadmin"]), findAll);
router.post("/", save);
router.get("/:id", findById);
router.delete("/:id",deleteById);
router.put("/:id",update);
router.get("/role/:roleId", authenticateToken, authorizeRole(["superadmin"]), findUserByRoleId);

module.exports = router;