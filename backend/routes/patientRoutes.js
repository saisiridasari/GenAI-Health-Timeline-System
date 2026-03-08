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

// ==================================================
// GET ALL PATIENTS (ENRICHED WITH ANALYTICS)
// ==================================================
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    const reports = await Report.find();

    const enrichedPatients = patients.map((patient) => {
      const patientReports = reports.filter(
        (r) => r.patient.toString() === patient._id.toString()
      );

      const reportCount = patientReports.length;

      const lastVisit =
        reportCount > 0
          ? patientReports.sort(
              (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
            )[0].uploadDate
          : null;

      // =========================
      // RISK SCORE (0–10 SCALE)
      // =========================
      let riskScore = 0;

      if (reportCount >= 2) {
        const sorted = [...patientReports].sort(
          (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
        );

        const latest = sorted[0].extractedData;
        const previous = sorted[1].extractedData;

        const getLab = (data, test) =>
          parseFloat(
            data?.lab_values?.find((l) => l.test === test)?.value || 0
          );

        const hLatest = getLab(latest, "Hemoglobin");
        const hPrev = getLab(previous, "Hemoglobin");
        const pLatest = getLab(latest, "Platelets");
        const pPrev = getLab(previous, "Platelets");

        if (hLatest < hPrev) riskScore += 3;
        if (pLatest < pPrev) riskScore += 3;
      }

      const allConditions = patientReports.flatMap(
        (r) => r.extractedData?.conditions || []
      );

      if (allConditions.length > 3) riskScore += 2;

      const hasRiskFlags = patientReports.some(
        (r) => r.extractedData?.riskFlags?.length > 0
      );

      if (hasRiskFlags) riskScore += 2;

      return {
        ...patient.toObject(),
        reportCount,
        lastVisit,
        riskScore,
      };
    });

    res.json(enrichedPatients);
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
        riskFlags: [],
        summary: "No data available.",
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

          if (!labHistory[testName]) labHistory[testName] = [];

          labHistory[testName].push({
            date: report.uploadDate,
            value: value,
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
      const values = labHistory[test].map((entry) => entry.value);

      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];

        if (last > first) trendAnalysis[test] = "Increasing Trend";
        else if (last < first) trendAnalysis[test] = "Decreasing Trend";
        else trendAnalysis[test] = "Stable";

        // Clinical Risk Thresholds
        if (test === "hemoglobin" && last < 12)
          riskFlags.push("⚠ Hemoglobin low — Possible anemia risk");

        if (test === "platelets" && last < 2.0)
          riskFlags.push("⚠ Platelets low — Possible bleeding risk");

        if (
          test === "c-reactive protein" &&
          trendAnalysis[test] === "Increasing Trend"
        )
          riskFlags.push(
            "⚠ CRP rising — Possible inflammatory escalation"
          );
      }
    });

    // -----------------------------------------
    // Clinical Summary
    // -----------------------------------------
    let summary = "No significant trends detected.";

    if (riskFlags.length > 0) {
      summary = "Clinical Summary: ";

      if (trendAnalysis["hemoglobin"] === "Decreasing Trend")
        summary +=
          "Hemoglobin levels are declining across visits, suggesting possible anemia. ";

      if (trendAnalysis["platelets"] === "Decreasing Trend")
        summary +=
          "Platelet levels are decreasing, indicating potential bleeding risk. ";

      if (trendAnalysis["c-reactive protein"] === "Increasing Trend")
        summary +=
          "CRP levels are rising, indicating possible inflammatory progression. ";

      summary += "Further clinical evaluation is recommended.";
    }

    res.json({
      labHistory,
      trendAnalysis,
      riskFlags,
      summary,
    });
  } catch (error) {
    console.error("Trend & Risk Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;