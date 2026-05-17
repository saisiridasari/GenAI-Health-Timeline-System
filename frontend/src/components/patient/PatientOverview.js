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

  // ==============================
  // FETCH PATIENT
  // ==============================
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

  // ==============================
  // FETCH REPORTS
  // ==============================
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

  // ==============================
  // FETCH TRENDS
  // ==============================
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

  // ==============================
  // LOADING
  // ==============================
  if (!patient) {
    return <div>Loading...</div>;
  }

  // ==============================
  // LATEST REPORT
  // ==============================
  const latestReport =
    reports.length > 0
      ? reports[reports.length - 1]
      : null;

  return (

    <div
      style={{
        display: "grid",
        gap: "25px"
      }}
    >

      {/* ============================== */}
      {/* PATIENT INFO */}
      {/* ============================== */}
      <div className="card">

        <h3 style={{ marginBottom: "22px" }}>
          Patient Information
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",
            gap: "20px"
          }}
        >

          <Info
            label="Name"
            value={patient.name}
          />

          <Info
            label="Age"
            value={patient.age}
          />

          <Info
            label="Gender"
            value={patient.gender}
          />

          <Info
            label="Contact"
            value={patient.contact}
          />

        </div>

      </div>

      {/* ============================== */}
      {/* LAB SNAPSHOT */}
      {/* ============================== */}
      <div className="card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}
        >

          <h3>
            Longitudinal Lab Snapshot
          </h3>

          {latestReport && (

            <span
              style={{
                fontSize: "13px",
                color: "#6b7280"
              }}
            >
              Clinical Analytics
            </span>

          )}

        </div>

        {reports.length === 0 ? (

          <p style={{ color: "#6b7280" }}>
            No lab data available.
          </p>

        ) : (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(320px,1fr))",
              gap: "20px"
            }}
          >

            {/* ============================== */}
            {/* GROUP LABS */}
            {/* ============================== */}
            {Object.entries(

              reports.reduce((acc, report) => {

                const labs =
                  report?.extractedData?.lab_values || [];

                labs.forEach((lab) => {

                  const key =
                    lab.test.toLowerCase();

                  if (!acc[key]) {
                    acc[key] = [];
                  }

                  // TAKE DATE FROM TIMELINE
                  const timelineDate =
                    report?.extractedData
                      ?.timeline?.[0]?.date;

                  acc[key].push({
                    value: lab.value,
                    date:
                      timelineDate ||
                      report.uploadDate
                  });

                });

                return acc;

              }, {})

            ).map(([testName, values], index) => {

              // SORT BY DATE
              values.sort(
                (a, b) =>
                  new Date(a.date) -
                  new Date(b.date)
              );

              const latest =
                values[values.length - 1];

              const previous =
                values.length > 1
                  ? values[values.length - 2]
                  : null;

              // FIX: store as number, format only for display
              const difference =
                previous
                  ? parseFloat(
                      (
                        parseFloat(latest.value) -
                        parseFloat(previous.value)
                      ).toFixed(1)
                    )
                  : null;

              return (

                <div
                  key={index}
                  style={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "22px",
                    background: "#ffffff"
                  }}
                >

                  {/* HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "20px"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#111827",
                        textTransform: "capitalize"
                      }}
                    >
                      {testName}
                    </div>

                    {difference !== null && (

                      <div
                        style={{
                          padding: "5px 10px",
                          borderRadius: "20px",

                          background:
                            difference > 0
                              ? "#dcfce7"
                              : difference < 0
                              ? "#fee2e2"
                              : "#e5e7eb",

                          color:
                            difference > 0
                              ? "#166534"
                              : difference < 0
                              ? "#991b1b"
                              : "#374151",

                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {difference > 0
                          ? `+${difference}`
                          : difference}
                      </div>

                    )}

                  </div>

                  {/* CURRENT VALUE */}
                  <div
                    style={{
                      marginBottom: "20px"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "40px",
                        fontWeight: "700",
                        color: "#111827",
                        lineHeight: "1"
                      }}
                    >
                      {latest.value}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginTop: "8px"
                      }}
                    >
                      Latest Reading
                      {" • "}
                      {new Date(
                        latest.date
                      ).toLocaleDateString()}
                    </div>

                  </div>

                  {/* HISTORY */}
                  <div
                    style={{
                      display: "grid",
                      gap: "10px"
                    }}
                  >

                    {values
                      .slice()
                      .reverse()
                      .map((item, idx) => (

                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom:
                              "1px solid #f3f4f6"
                          }}
                        >

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6b7280"
                            }}
                          >
                            {new Date(
                              item.date
                            ).toLocaleDateString()}
                          </div>

                          <div
                            style={{
                              fontWeight: "600",
                              color: "#111827"
                            }}
                          >
                            {item.value}
                          </div>

                        </div>

                      ))}

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

      {/* ============================== */}
      {/* ACTIVE RISK FLAGS */}
      {/* ============================== */}
      <div className="card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}
        >

          <h3>
            Active Risk Assessment
          </h3>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background:
                analysis?.riskFlags?.length > 3
                  ? "#fee2e2"
                  : analysis?.riskFlags?.length > 0
                  ? "#fef3c7"
                  : "#dcfce7",

              color:
                analysis?.riskFlags?.length > 3
                  ? "#991b1b"
                  : analysis?.riskFlags?.length > 0
                  ? "#92400e"
                  : "#166534",

              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            {analysis?.riskFlags?.length > 3
              ? "High Risk"
              : analysis?.riskFlags?.length > 0
              ? "Moderate Risk"
              : "Low Risk"}
          </div>

        </div>

        {analysis?.riskFlags?.length ? (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "16px"
            }}
          >

            {analysis.riskFlags.map(
              (risk, index) => (

                <div
                  key={index}
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#fff5f5",
                    border: "1px solid #fecaca"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px"
                    }}
                  >

                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#dc2626"
                      }}
                    />

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#991b1b"
                      }}
                    >
                      Clinical Risk Indicator
                    </div>

                  </div>

                  <div
                    style={{
                      color: "#7f1d1d",
                      lineHeight: "1.7",
                      fontSize: "14px"
                    }}
                  >
                    {risk}
                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534"
            }}
          >
            No active clinical risks detected.
          </div>

        )}

      </div>

      {/* ============================== */}
      {/* CLINICAL SUMMARY */}
      {/* ============================== */}
      <div className="card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}
        >

          <h3>
            AI Clinical Intelligence Summary
          </h3>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            Longitudinal Analysis
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gap: "20px"
          }}
        >

          {/* PRIMARY SUMMARY */}
          <div
            style={{
              padding: "22px",
              borderRadius: "16px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb"
            }}
          >

            <div
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "12px"
              }}
            >
              Clinical Interpretation
            </div>

            <div
              style={{
                color: "#374151",
                lineHeight: "1.9",
                fontSize: "15px"
              }}
            >
              {analysis?.summary ||
                "No clinical intelligence summary available."}
            </div>

          </div>

          {/* INSIGHT CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(240px,1fr))",
              gap: "16px"
            }}
          >

            {/* CONDITIONS */}
            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe"
              }}
            >

              <div
                style={{
                  fontSize: "13px",
                  color: "#2563eb",
                  marginBottom: "10px"
                }}
              >
                Clinical Conditions
              </div>

              <div
                style={{
                  fontWeight: "600",
                  color: "#1e3a8a",
                  lineHeight: "1.6"
                }}
              >
                {latestReport?.extractedData
                  ?.conditions?.join(", ")
                  || "No conditions detected"}
              </div>

            </div>

            {/* MEDICATIONS */}
            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe"
              }}
            >

              <div
                style={{
                  fontSize: "13px",
                  color: "#7c3aed",
                  marginBottom: "10px"
                }}
              >
                Active Medications
              </div>

              <div
                style={{
                  fontWeight: "600",
                  color: "#5b21b6",
                  lineHeight: "1.6"
                }}
              >
                {latestReport?.extractedData
                  ?.medications?.join(", ")
                  || "No medications detected"}
              </div>

            </div>

            {/* MONITORING */}
            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0"
              }}
            >

              <div
                style={{
                  fontSize: "13px",
                  color: "#16a34a",
                  marginBottom: "10px"
                }}
              >
                Recommendation
              </div>

              <div
                style={{
                  fontWeight: "600",
                  color: "#166534",
                  lineHeight: "1.6"
                }}
              >
                Continue longitudinal clinical monitoring and follow-up evaluation.
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

// ==============================
// INFO CARD
// ==============================
function Info({ label, value }) {

  return (

    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb"
      }}
    >

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "8px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "17px",
          fontWeight: "600",
          color: "#111827"
        }}
      >
        {value}
      </div>

    </div>

  );
}

export default PatientOverview;