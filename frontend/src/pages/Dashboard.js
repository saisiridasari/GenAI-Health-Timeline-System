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
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOverview();
    fetchPatients();
  }, []);

  const fetchOverview = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/overview"
    );
    setOverview(res.data);
  };

  const fetchPatients = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/patients"
    );
    setPatients(res.data);
  };

  if (!overview) return <div style={{ padding: 40 }}>Loading...</div>;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p._id.includes(search)
  );

  const barData = {
    labels: Object.keys(overview.conditionDistribution || {}),
    datasets: [
      {
        data: Object.values(overview.conditionDistribution || {}),
        backgroundColor: "#2563eb"
      }
    ]
  };

  return (
    <div>
      <h1 className="page-title">Clinical Overview</h1>

      {/* ===== Metrics ===== */}
      <div style={metricGrid}>
        <Metric title="Total Patients" value={overview.totalPatients} />
        <Metric title="Total Reports" value={overview.totalReports} />
        <Metric title="Active Risks" value={overview.totalRisks} />
        <Metric title="High Risk Patients" value={overview.highRiskPatients} />
      </div>

      {/* ===== Chart ===== */}
      <div className="card" style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 20 }}>Condition Distribution</h3>
        <div style={{ height: 160 }}>
          <Bar
            data={barData}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </div>

      {/* ===== Patient Table ===== */}
      <div className="card">
        <div style={tableHeader}>
          <h3>Patient Registry</h3>

          <input
            placeholder="Search by Name or Patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>Name</th>
              <th style={th}>Age</th>
              <th style={th}>Gender</th>
              <th style={th}>Contact</th>
              <th style={th}>Risk</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr
                key={p._id}
                style={{
                  background: p.riskScore > 70 ? "#fef2f2" : "white"
                }}
              >
                <td style={td}>{p.name}</td>
                <td style={td}>{p.age}</td>
                <td style={td}>{p.gender}</td>
                <td style={td}>{p.contact}</td>

                {/* Risk Badge */}
                <td style={td}>
                  {p.riskScore > 70 ? (
                    <span style={badgeHigh}>High</span>
                  ) : p.riskScore > 40 ? (
                    <span style={badgeMid}>Moderate</span>
                  ) : (
                    <span style={badgeLow}>Low</span>
                  )}
                </td>

                <td style={td}>
                  <Link to={`/patients/${p._id}`}>
                    <button style={btn}>Open</button>
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

/* ===== Components ===== */

function Metric({ title, value }) {
  return (
    <div className="card">
      <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

/* ===== Styles ===== */

const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 20,
  marginBottom: 40
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
};

const searchInput = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  width: 250
};

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = { padding: 12, textAlign: "left", fontSize: 14 };
const td = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
  fontSize: 14
};

const btn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

const badgeHigh = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12
};

const badgeMid = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12
};

const badgeLow = {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12
};

export default Dashboard;