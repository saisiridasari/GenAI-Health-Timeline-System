const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Report = require("../models/Report");


// ==================================================
// PATIENT CRUD ROUTES
// ==================================================

// Create Patient
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get All Patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Patient
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    res.json(patient);
  } catch (error) {
    res.status(404).json({ message: "Patient not found" });
  }
});

// Update Patient
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

// Delete Patient
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ==================================================
// PHASE 5 + PHASE 6
// TREND DETECTION + RISK FLAGGING
// ==================================================

router.get("/trends/:patientId", async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.params.patientId });

    if (!reports || reports.length === 0) {
      return res.json({
        labHistory: {},
        trendAnalysis: {},
        riskFlags: []
      });
    }

    let labHistory = {};

    // -----------------------------------------
    // Collect Lab History Across Reports
    // -----------------------------------------
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

    // -----------------------------------------
    // Sort Labs Chronologically
    // -----------------------------------------
    Object.keys(labHistory).forEach((test) => {
      labHistory[test].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    });

    let trendAnalysis = {};
    let riskFlags = [];

    // -----------------------------------------
    // Trend + Risk Logic
    // -----------------------------------------
    Object.keys(labHistory).forEach((test) => {

      const values = labHistory[test].map(entry => entry.value);

      if (values.length >= 2) {

        const first = values[0];
        const last = values[values.length - 1];

        // Trend Detection
        if (last > first) {
          trendAnalysis[test] = "Increasing Trend";
        } else if (last < first) {
          trendAnalysis[test] = "Decreasing Trend";
        } else {
          trendAnalysis[test] = "Stable";
        }

        // -------------------------
        // Clinical Risk Thresholds
        // -------------------------

        if (test === "hemoglobin") {
          if (last < 12) {
            riskFlags.push("⚠ Hemoglobin low — Possible anemia risk");
          }
        }

        if (test === "platelets") {
          if (last < 2.0) {
            riskFlags.push("⚠ Platelets low — Possible bleeding risk");
          }
        }

        if (test === "c-reactive protein") {
          if (trendAnalysis[test] === "Increasing Trend") {
            riskFlags.push("⚠ CRP rising — Possible inflammatory escalation");
          }
        }
      }
    });
    let summary = "No significant trends detected.";

if (riskFlags.length > 0) {
  summary = "Clinical Summary: ";

  if (trendAnalysis["hemoglobin"] === "Decreasing Trend") {
    summary += "Hemoglobin levels are declining across visits, suggesting possible anemia. ";
  }

  if (trendAnalysis["platelets"] === "Decreasing Trend") {
    summary += "Platelet levels are decreasing, indicating potential bleeding risk. ";
  }

  if (trendAnalysis["c-reactive protein"] === "Increasing Trend") {
    summary += "CRP levels are rising, indicating possible inflammatory progression. ";
  }

  summary += "Further clinical evaluation is recommended.";
}
    res.json({
  labHistory,
  trendAnalysis,
  riskFlags,
  summary
});

  } catch (error) {
    console.error("Trend & Risk Error:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;