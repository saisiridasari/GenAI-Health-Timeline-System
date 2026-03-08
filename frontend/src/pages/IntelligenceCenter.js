import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function IntelligenceCenter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/intelligence"
    );
    setData(res.data);
  };

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">AI Intelligence Center</h1>

      {/* High Risk Patients */}
      <Section title="High Risk Patients">
        {data.highRiskPatients.length === 0 && <Empty />}

        {data.highRiskPatients.map(p => (
          <Card key={p.patientId} danger>
            <div>
              <strong>{p.name}</strong>
              <div>Risk Score: {p.riskScore}/10</div>
            </div>
            <Link to={`/patients/${p.patientId}`}>
              <button style={btn}>View</button>
            </Link>
          </Card>
        ))}
      </Section>

      {/* Active Risk Alerts */}
      <Section title="Active Risk Alerts">
        {data.activeRiskAlerts.length === 0 && <Empty />}

        {data.activeRiskAlerts.map((p, i) => (
          <Card key={i} warning>
            <div>
              <strong>{p.name}</strong>
              <ul>
                {p.flags.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
            <Link to={`/patients/${p.patientId}`}>
              <button style={btn}>Open</button>
            </Link>
          </Card>
        ))}
      </Section>

      {/* Worsening Trends */}
      <Section title="Worsening Trends">
        {data.worseningTrends.length === 0 && <Empty />}

        {data.worseningTrends.map((t, i) => (
          <Card key={i}>
            <div>
              <strong>{t.name}</strong>
              <div>{t.test}</div>
            </div>
            <Link to={`/patients/${t.patientId}`}>
              <button style={btn}>Open</button>
            </Link>
          </Card>
        ))}
      </Section>
    </div>
  );
}

/* UI Components */

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ marginBottom: 20 }}>{title}</h2>
    <div style={{ display: "grid", gap: 16 }}>{children}</div>
  </div>
);

const Card = ({ children, danger, warning }) => (
  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      borderLeft: danger
        ? "6px solid #dc2626"
        : warning
        ? "6px solid #f59e0b"
        : "6px solid #2563eb"
    }}
  >
    {children}
  </div>
);

const Empty = () => (
  <div style={{ color: "#6b7280" }}>No records found.</div>
);

const btn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

export default IntelligenceCenter;