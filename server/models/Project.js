const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // ========================================
    // Project Basic Information
    // ========================================

    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },

    // ========================================
    // Project Dates
    // ========================================

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // ========================================
    // Priority
    // ========================================

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // ========================================
    // Project Status
    // ========================================

    status: {
      type: String,
      enum: [
        "planning",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
      ],
      default: "planning",
    },

    // ========================================
    // Project Manager
    // ========================================

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project manager is required"],
    },

    // ========================================
    // Team Members
    // ========================================

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ========================================
    // Project Progress
    // ========================================
    // Progress will be calculated automatically
    // from completed tasks.
    //
    // Example:
    // 0 / 5 tasks completed  = 0%
    // 2 / 5 tasks completed  = 40%
    // 5 / 5 tasks completed  = 100%
    //
    // Manager/Admin should NOT manually
    // control this value.

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ========================================
    // Created By
    // ========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// Validate Project Dates
// ========================================

projectSchema.pre("validate", function () {
  if (this.startDate && this.endDate) {
    if (this.endDate < this.startDate) {
      throw new Error("End date cannot be before start date");
    }
  }
});

// ========================================
// Export Model
// ========================================

module.exports = mongoose.model("Project", projectSchema);