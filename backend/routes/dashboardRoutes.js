const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Report = require("../models/Report");

router.get("/overview", async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalReports = await Report.countDocuments();

    const reports = await Report.find();

    let totalRisks = 0;
    let conditionDistribution = {};

    reports.forEach(report => {
      if (report.extractedData?.conditions) {
        report.extractedData.conditions.forEach(cond => {
          conditionDistribution[cond] =
            (conditionDistribution[cond] || 0) + 1;
        });
      }

      if (report.extractedData?.lab_values) {
        report.extractedData.lab_values.forEach(lab => {
          const value = parseFloat(lab.value);

          if (
            (lab.test.toLowerCase() === "hemoglobin" && value < 12) ||
            (lab.test.toLowerCase() === "platelets" && value < 2)
          ) {
            totalRisks++;
          }
        });
      }
    });

    res.json({
      totalPatients,
      totalReports,
      totalRisks,
      highRiskPatients: totalRisks, // simplified logic
      conditionDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;