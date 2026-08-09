const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team member is required"],
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in-progress",
        "review",
        "completed",
      ],
      default: "todo",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

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
// Keep Progress & Status in Sync
// ========================================

taskSchema.pre("save", function () {
  if (this.status === "todo") {
    this.progress = 0;
  }

  if (this.status === "in-progress") {
    if (this.progress === 0) {
      this.progress = 50;
    }
  }

  if (this.status === "review") {
    this.progress = 90;
  }

  if (this.status === "completed") {
    this.progress = 100;
  }
});

module.exports = mongoose.model("Task", taskSchema);