const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  role: {
    type: String,
    default: "user"
  },
  name: String,
  email: String,
  phone: String,
  assignedPlaces: {
    type: [String],
    default: []
  },
  subscription: {
    active: {
      type: Boolean,
      default: false
    },
    plan: String,
    expiryDate: Date
  }
});

module.exports = mongoose.model("User", UserSchema);