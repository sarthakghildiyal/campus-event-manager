const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  createdBy: { type: String, required: true },
});

module.exports = mongoose.model("Event", eventSchema);
