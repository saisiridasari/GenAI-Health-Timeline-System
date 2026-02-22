const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    contact: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);