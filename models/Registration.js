const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Event" },
  studentEmail: String,
  studentName: String,
  description: String,
  phone: String,
  registeredAt: Date
});

module.exports = mongoose.model("Registration", registrationSchema);