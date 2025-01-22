const express = require("express");
const {
    saveRole,
    findRoleById,
    findAllRoles
} = require("../controller/role_controller");
const {authenticateToken,authorizeRole} = require("../security/auth")

const router = express.Router();

// Get all roles
router.get("/", authenticateToken, authorizeRole(["admin","superadmin"]), findAllRoles);

// Create a new role
router.post("/", authenticateToken, authorizeRole(["admin","superadmin"]), saveRole);

// Get a role by ID
router.get("/:roleId", authenticateToken, authorizeRole(["admin","superadmin"]), findRoleById);

module.exports = router;
