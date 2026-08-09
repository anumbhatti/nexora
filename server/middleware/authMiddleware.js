const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// Protect Routes
// ========================================

const protect = async (req, res, next) => {
  try {
    let token;

    // ========================================
    // Check Authorization Header
    // ========================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token =
        req.headers.authorization.split(" ")[1];
    }

    // ========================================
    // No Token
    // ========================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authorized. Please login first.",
      });
    }

    // ========================================
    // Verify Token
    // ========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================
    // Find User
    // ========================================

    const user = await User.findById(
      decoded.id
    ).select("-password");

    // ========================================
    // User Not Found
    // ========================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // ========================================
    // Account Inactive
    // ========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated.",
      });
    }

    // ========================================
    // Attach User
    // ========================================

    req.user = user;

    // DEBUG
    console.log("Authenticated User:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

// ========================================
// Role Authorization
// ========================================

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // Convert role to lowercase
    const userRole =
      req.user.role?.toLowerCase();

    // Convert allowed roles to lowercase
    const allowedRoles = roles.map(
      (role) => role.toLowerCase()
    );

    // ========================================
    // Check Role
    // ========================================

    if (!allowedRoles.includes(userRole)) {
      console.log(
        "Authorization Failed:",
        {
          userRole,
          allowedRoles,
          userId: req.user._id,
        }
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to perform this action.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};