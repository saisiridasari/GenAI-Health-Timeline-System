import { useEffect, useState } from "react";
import axios from "axios";

function PatientTimeline({ patientId }) {
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
      console.error("Timeline fetch error:", error);
    }
  };

  // Merge all timeline events
  const mergedTimeline = reports
    .flatMap(report =>
      report.extractedData?.timeline?.map(event => ({
        ...event,
        uploadDate: report.uploadDate
      })) || []
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!reports.length) return <div>Loading...</div>;

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>
        Master Timeline
      </h3>

      {mergedTimeline.length === 0 ? (
        <p style={{ color: "#6b7280" }}>
          No timeline events available.
        </p>
      ) : (
        <div style={{ borderLeft: "3px solid #2563eb", paddingLeft: "20px" }}>
          {mergedTimeline.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "25px",
                position: "relative"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-28px",
                  top: "5px",
                  width: "12px",
                  height: "12px",
                  background: "#2563eb",
                  borderRadius: "50%"
                }}
              />

              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                {item.date}
              </div>

              <div style={{ fontSize: "15px", marginTop: "5px" }}>
                {item.event}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientTimeline;