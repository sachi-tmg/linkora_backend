const Role = require("../model/role");

// Save a new role
const saveRole = async (req, res) => {
    try {
        const { roleId, roleName } = req.body;

        // Check if the role already exists
        const existingRole = await Role.findOne({ roleName });
        if (existingRole) {
            return res.status(400).json({ message: "Role already exists" });
        }

        // Create and save the new role
        const newRole = new Role({ roleId, roleName });
        await newRole.save();
        res.status(201).json({ message: "Role created successfully", role: newRole });
    } catch (e) {
        res.status(500).json({ message: "Error creating role", error: e });
    }
};

// Find all roles
const findAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (e) {
        res.status(500).json({ message: "Error retrieving roles", error: e });
    }
};

// Find a role by roleId
const findRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;

        // Find role by its roleId
        const role = await Role.findOne({ roleId });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json(role);
    } catch (e) {
        res.status(500).json({ message: "Error retrieving role", error: e });
    }
};

module.exports = {
    saveRole,
    findAllRoles,
    findRoleById,
};
