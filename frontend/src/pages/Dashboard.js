import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchOverview();
    fetchPatients();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/overview"
      );
      setOverview(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/patients"
      );
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!overview) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  const barData = {
    labels: Object.keys(overview.conditionDistribution || {}),
    datasets: [
      {
        label: "Cases",
        data: Object.values(overview.conditionDistribution || {}),
        backgroundColor: "#2563eb"
      }
    ]
  };

  return (
    <div>
      <h1 className="page-title">Clinical Overview</h1>

      {/* ===== Metrics ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px"
        }}
      >
        <Metric title="Total Patients" value={overview.totalPatients} />
        <Metric title="Total Reports" value={overview.totalReports} />
        <Metric title="Active Risks" value={overview.totalRisks} />
        <Metric title="High Risk Patients" value={overview.highRiskPatients} />
      </div>

      {/* ===== Chart + Summary ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginBottom: "50px"
        }}
      >
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>
            Condition Distribution
          </h3>

          <div style={{ height: "250px" }}>
            <Bar
              data={barData}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>
            System Summary
          </h3>

          <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
            The platform is tracking{" "}
            <strong>{overview.totalPatients}</strong> patients with{" "}
            <strong>{overview.totalReports}</strong> uploaded reports.
            <br />
            Active clinical risks detected:{" "}
            <strong>{overview.totalRisks}</strong>.
          </p>
        </div>
      </div>

      {/* ===== Patient Table ===== */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          Patient Registry
        </h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Age</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Intelligence</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td style={tdStyle}>{patient.name}</td>
                <td style={tdStyle}>{patient.age}</td>
                <td style={tdStyle}>{patient.gender}</td>
                <td style={tdStyle}>{patient.contact}</td>
                <td style={tdStyle}>
                  <Link to={`/patients/${patient._id}`}>
                    <button style={btnStyle}>
                      Open Intelligence
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="card">
      <div style={{ fontSize: "13px", color: "#6b7280" }}>
        {title}
      </div>
      <div
        style={{
          fontSize: "26px",
          fontWeight: "600",
          marginTop: "8px"
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px"
};

const btnStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

export default Dashboard;