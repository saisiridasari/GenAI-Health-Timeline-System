const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Report = require("../models/Report");


// ===============================
// CREATE PATIENT
// ===============================
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// ===============================
// GET ALL PATIENTS
// ===============================
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET SINGLE PATIENT
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    res.json(patient);
  } catch (error) {
    res.status(404).json({ message: "Patient not found" });
  }
});


// ===============================
// UPDATE PATIENT
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// ===============================
// DELETE PATIENT
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ==================================================
// PHASE 5 - LAB TREND ANALYSIS
// ==================================================
router.get("/trends/:patientId", async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.params.patientId });

    let labHistory = {};

    reports.forEach((report) => {

      if (report.extractedData && report.extractedData.lab_values) {

        report.extractedData.lab_values.forEach((lab) => {

          const testName = lab.test.trim().toLowerCase();
          const value = parseFloat(lab.value);

          if (!labHistory[testName]) {
            labHistory[testName] = [];
          }

          labHistory[testName].push({
            date: report.uploadDate,
            value: value
          });
        });
      }
    });

    // Sort each test by date
    Object.keys(labHistory).forEach((test) => {
      labHistory[test].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    });

    let trendAnalysis = {};

    Object.keys(labHistory).forEach((test) => {
      const values = labHistory[test].map(entry => entry.value);

      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];

        if (last > first) {
          trendAnalysis[test] = "Increasing Trend ⚠";
        } else if (last < first) {
          trendAnalysis[test] = "Decreasing Trend ✅";
        } else {
          trendAnalysis[test] = "Stable";
        }
      }
    });

    res.json({
      labHistory,
      trendAnalysis
    });

  } catch (error) {
    console.error("Trend Error:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;