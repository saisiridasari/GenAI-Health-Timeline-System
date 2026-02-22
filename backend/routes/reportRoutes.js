const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const Report = require("../models/Report");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Upload report + call AI
router.post("/:patientId", upload.single("report"), async (req, res) => {
    try {
        // Step 1: Save report initially
        const report = await Report.create({
            patient: req.params.patientId,
            fileName: req.file.filename,
            filePath: req.file.path
        });

        // Step 2: Send file to AI service
        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/extract",
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        // Step 3: Save extracted data
        report.extractedData = {
    ...aiResponse.data.entities,
    timeline: aiResponse.data.timeline
};
        await report.save();

        res.status(201).json(report);

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// Get reports
router.get("/:patientId", async (req, res) => {
    const reports = await Report.find({ patient: req.params.patientId });
    res.json(reports);
});

module.exports = router;