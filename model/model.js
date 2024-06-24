const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  token: {
    required: true,
    type: String,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Data", dataSchema);
