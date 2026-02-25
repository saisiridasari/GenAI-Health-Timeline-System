import { useEffect, useState } from "react";
import axios from "axios";

function PatientOverview({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchPatient();
    fetchReports();
    fetchTrends();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/${patientId}`
      );
      setPatient(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reports/${patientId}`
      );
      setReports(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/trends/${patientId}`
      );
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!patient) return <div>Loading...</div>;

  const latestReport = reports.length
    ? reports[reports.length - 1]
    : null;

  return (
    <div style={{ display: "grid", gap: "30px" }}>
      
      {/* ===== Patient Info ===== */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          Patient Information
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Info label="Name" value={patient.name} />
          <Info label="Age" value={patient.age} />
          <Info label="Gender" value={patient.gender} />
          <Info label="Contact" value={patient.contact} />
        </div>
      </div>

      {/* ===== Latest Labs ===== */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          Latest Lab Snapshot
        </h3>

        {latestReport?.extractedData?.lab_values?.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {latestReport.extractedData.lab_values.map((lab, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  background: "#f3f4f6"
                }}
              >
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  {lab.test}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>
                  {lab.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No lab data available.</p>
        )}
      </div>

      {/* ===== Risk Flags ===== */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          Active Risk Flags
        </h3>

        {analysis?.riskFlags?.length ? (
          analysis.riskFlags.map((risk, index) => (
            <div
              key={index}
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#991b1b",
                marginBottom: "10px",
                fontSize: "14px"
              }}
            >
              {risk}
            </div>
          ))
        ) : (
          <p style={{ color: "#6b7280" }}>
            No active risks detected.
          </p>
        )}
      </div>

      {/* ===== Clinical Summary ===== */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          Clinical Summary
        </h3>

        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
          {analysis?.summary || "No summary available."}
        </p>
      </div>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "13px", color: "#6b7280" }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", fontWeight: "600" }}>
        {value}
      </div>
    </div>
  );
}

export default PatientOverview;