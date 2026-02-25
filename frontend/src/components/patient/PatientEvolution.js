import { useEffect, useState } from "react";
import axios from "axios";

function PatientEvolution({ patientId }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, [patientId]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reports/${patientId}`
      );
      setReports(res.data);
    } catch (error) {
      console.error("Evolution fetch error:", error);
    }
  };

  if (reports.length < 2) {
    return (
      <div className="card">
        <p style={{ color: "#6b7280" }}>
          At least two reports are required for evolution analysis.
        </p>
      </div>
    );
  }

  // Sort newest first
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
  );

  const latest = sortedReports[0];
  const previous = sortedReports[1];

  // 🔹 Normalize strings (trim + lowercase)
  const normalize = (arr) =>
    (arr || []).map(item =>
      item.trim().toLowerCase()
    );

  const latestConditions = new Set(
    normalize(latest.extractedData?.conditions)
  );

  const previousConditions = new Set(
    normalize(previous.extractedData?.conditions)
  );

  const latestMeds = new Set(
    normalize(latest.extractedData?.medications)
  );

  const previousMeds = new Set(
    normalize(previous.extractedData?.medications)
  );

  // 🔹 Comparison Logic
  const newConditions = [...latestConditions].filter(
    c => !previousConditions.has(c)
  );

  const resolvedConditions = [...previousConditions].filter(
    c => !latestConditions.has(c)
  );

  const persistentConditions = [...latestConditions].filter(
    c => previousConditions.has(c)
  );

  const addedMeds = [...latestMeds].filter(
    m => !previousMeds.has(m)
  );

  const discontinuedMeds = [...previousMeds].filter(
    m => !latestMeds.has(m)
  );

  return (
    <div style={{ display: "grid", gap: "25px" }}>

      <Section
        title="New Conditions Detected"
        items={newConditions}
        bg="#fee2e2"
        color="#991b1b"
      />

      <Section
        title="Resolved Conditions"
        items={resolvedConditions}
        bg="#dcfce7"
        color="#166534"
      />

      <Section
        title="Persistent Conditions"
        items={persistentConditions}
        bg="#e0f2fe"
        color="#075985"
      />

      <Section
        title="Medications Added"
        items={addedMeds}
        bg="#ede9fe"
        color="#5b21b6"
      />

      <Section
        title="Medications Discontinued"
        items={discontinuedMeds}
        bg="#fef3c7"
        color="#92400e"
      />

    </div>
  );
}

function Section({ title, items, bg, color }) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: "15px" }}>
        {title}
      </h3>

      {items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: bg,
              color: color,
              marginBottom: "8px",
              fontSize: "14px"
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </div>
        ))
      ) : (
        <p style={{ color: "#6b7280" }}>
          None detected.
        </p>
      )}
    </div>
  );
}

export default PatientEvolution;