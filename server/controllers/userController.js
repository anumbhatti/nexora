const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Project = require("../models/Project");

// ==============================
// Get Current User Profile
// ==============================
const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get All Users - Admin
// ==============================
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by role
    if (role && ["admin", "manager", "member"].includes(role)) {
      filter.role = role;
    }

    // Filter by active/inactive status
    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Single User - Admin
// ==============================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Create User - Admin
// ==============================
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    if (!["admin", "manager", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Update User - Admin
// ==============================
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      isActive,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (
      user._id.toString() === req.user._id.toString() &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already being used",
        });
      }

      user.email = email;
    }

    if (role !== undefined) {
      if (!["admin", "manager", "member"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Toggle User Status - Admin
// ==============================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (
      user._id.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    const updatedUser = await User.findById(
      user._id
    ).select("-password");

    res.status(200).json({
      success: true,
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle User Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==============================
// Delete User - Admin
// ==============================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (
      user._id.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Manager Team Members
// ==============================
const getManagerTeam = async (req, res) => {
  try {
    const { search, status } = req.query;

    // Find projects managed by logged-in manager
    const projects = await Project.find({
      manager: req.user._id,
    })
      .select("name status teamMembers")
      .populate(
        "teamMembers",
        "name email role isActive createdAt"
      );

    // Collect unique team members
    const membersMap = new Map();

    projects.forEach((project) => {
      project.teamMembers.forEach((member) => {
        if (!membersMap.has(member._id.toString())) {
          membersMap.set(member._id.toString(), {
            ...member.toObject(),
            projects: [],
          });
        }

        membersMap.get(member._id.toString()).projects.push({
          _id: project._id,
          name: project.name,
          status: project.status,
        });
      });
    });

    let members = Array.from(membersMap.values());

    // Search
    if (search) {
      const searchValue = search.toLowerCase();

      members = members.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchValue) ||
          member.email?.toLowerCase().includes(searchValue)
      );
    }

    // Active / inactive filter
    if (status === "active") {
      members = members.filter(
        (member) => member.isActive === true
      );
    }

    if (status === "inactive") {
      members = members.filter(
        (member) => member.isActive === false
      );
    }

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get Manager Team Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Change Password - Own Profile
// ==============================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  changePassword,
  getManagerTeam,
};