const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    fileName: String,
    filePath: String,
    uploadDate: {
        type: Date,
        default: Date.now
    },
    extractedData: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);