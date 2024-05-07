const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Kérlek add meg a neved"],
  },
  email: {
    type: String,
    required: [true, "Kérlek add meg az emailed"],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Kérlek érvényes email címet adj meg"],
  },
  password: {
    type: String,
    required: [true, "Kérlek add meg a jelszavad"],
    minlength: 8,
    maxlength: 60,
  },
  confirmPassword: {
    type: String,
    required: [false, "Erositsd meg a jelszavad"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Jelszavak nem egyeznek.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  phoneNumber: {
    type: String,
    required: [true, "Telefonszám megadása kötelező!"],
    match: [
      /^\+?\d{1,3}\s?\d{1,20}$/,
      "Kérlek érvényes telefonszámot adj meg!",
    ],
  },
  pinCode: {
    type: String,
    required: [false, "PIN kód generálása kötelező"],
  },
  pinCodeExpires: {
    type: Date,
    required: [false, "PIN kód lejárati idejének megadása kötelező"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  lastPinRequest: {
    type: Date,
    default: null,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
