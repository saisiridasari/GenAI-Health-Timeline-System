const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Report = require("../models/Report");

/* =====================================
   DASHBOARD OVERVIEW (for homepage)
   ===================================== */
router.get("/overview", async (req, res) => {
  try {
    const patients = await Patient.find();
    const reports = await Report.find();

    const totalPatients = patients.length;
    const totalReports = reports.length;

    let totalRisks = 0;
    let highRiskPatients = 0;
    let conditionDistribution = {};

    // Loop each patient
    for (const patient of patients) {
      const patientReports = reports.filter(
        r => r.patient.toString() === patient._id.toString()
      );

      if (patientReports.length === 0) continue;

      // =========================
      // Risk Score (0–10 logic)
      // =========================
      let riskScore = 0;

      if (patientReports.length >= 2) {
        const sorted = [...patientReports].sort(
          (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
        );

        const latest = sorted[0].extractedData;
        const prev = sorted[1].extractedData;

        const getLab = (data, test) =>
          parseFloat(
            data?.lab_values?.find(l => l.test === test)?.value || 0
          );

        const h1 = getLab(latest, "Hemoglobin");
        const h2 = getLab(prev, "Hemoglobin");
        const p1 = getLab(latest, "Platelets");
        const p2 = getLab(prev, "Platelets");

        if (h1 < h2) riskScore += 3;
        if (p1 < p2) riskScore += 3;
      }

      const allConditions = patientReports.flatMap(
        r => r.extractedData?.conditions || []
      );

      allConditions.forEach(cond => {
        const key = cond.trim();
        conditionDistribution[key] =
          (conditionDistribution[key] || 0) + 1;
      });

      if (allConditions.length > 3) riskScore += 2;

      const hasRiskFlags = patientReports.some(
        r => r.extractedData?.riskFlags?.length > 0
      );

      if (hasRiskFlags) {
        riskScore += 2;
        totalRisks += 1;
      }

      if (riskScore >= 7) highRiskPatients += 1;
    }

    res.json({
      totalPatients,
      totalReports,
      totalRisks,
      highRiskPatients,
      conditionDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =====================================
   INTELLIGENCE CENTER API
   ===================================== */
router.get("/intelligence", async (req, res) => {
  try {
    const patients = await Patient.find();
    const reports = await Report.find();

    let highRiskPatients = [];
    let activeRiskAlerts = [];
    let worseningTrends = [];

    for (const patient of patients) {
      const patientReports = reports.filter(
        r => r.patient.toString() === patient._id.toString()
      );

      if (patientReports.length === 0) continue;

      let riskScore = 0;

      if (patientReports.length >= 2) {
        const sorted = [...patientReports].sort(
          (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
        );

        const latest = sorted[0].extractedData;
        const prev = sorted[1].extractedData;

        const getLab = (data, test) =>
          parseFloat(
            data?.lab_values?.find(l => l.test === test)?.value || 0
          );

        const h1 = getLab(latest, "Hemoglobin");
        const h2 = getLab(prev, "Hemoglobin");
        const p1 = getLab(latest, "Platelets");
        const p2 = getLab(prev, "Platelets");

        if (h1 < h2) {
          riskScore += 3;
          worseningTrends.push({
            patientId: patient._id,
            name: patient.name,
            test: "Hemoglobin decreasing",
          });
        }

        if (p1 < p2) {
          riskScore += 3;
          worseningTrends.push({
            patientId: patient._id,
            name: patient.name,
            test: "Platelets decreasing",
          });
        }
      }

      const allConditions = patientReports.flatMap(
        r => r.extractedData?.conditions || []
      );

      if (allConditions.length > 3) riskScore += 2;

      const riskFlagReports = patientReports.filter(
        r => r.extractedData?.riskFlags?.length > 0
      );

      if (riskFlagReports.length > 0) {
        riskScore += 2;

        activeRiskAlerts.push({
          patientId: patient._id,
          name: patient.name,
          flags: riskFlagReports.flatMap(
            r => r.extractedData.riskFlags
          ),
        });
      }

      if (riskScore >= 7) {
        highRiskPatients.push({
          patientId: patient._id,
          name: patient.name,
          riskScore,
        });
      }
    }

    res.json({
      highRiskPatients,
      activeRiskAlerts,
      worseningTrends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;