const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conference",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  workplace: {
    type: String,
    required: false,
  },
  workplacePosition: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["guest", "speaker"],
  },
  presentationFile: {
    type: String,
    required: function () {
      return this.role === "speaker";
    },
  },
  profileImage: {
    type: String,
    required: function () {
      return this.role === "speaker";
    },
  },
  speakerSubject: {
    type: String,
    required: function () {
      return this.role === "speaker";
    },
  },
  specialTechNeeds: {
    type: String,
    required: false,
  },
  selectedDays: [
    {
      type: Date,
      required: true,
    },
  ],
  selectedHotelRoomDays: [
    {
      type: Date,
      required: false,
    },
  ],
  selectedFacultativePrograms: [
    {
      name: String,
      cost: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  presentationTime: {
    type: Date,
    required: false,
  },
  approvalStatus: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  menuSelections: [
    {
      date: Date,
      selection: {
        type: String,
        enum: ["traditional", "vegetarian", "vegan", ""],
      },
    },
  ],
  glutenSensitive: {
    type: Boolean,
    required: true,
  },
  flourSensitive: {
    type: Boolean,
    required: true,
  },
  mobilityIssues: {
    type: Boolean,
    required: true,
  },
  additionalNotes: {
    type: String,
    required: false,
  },
  totalCost: {
    type: Number,
    required: true,
  },
});

const Apply = mongoose.model("Apply", applySchema);
module.exports = Apply;
