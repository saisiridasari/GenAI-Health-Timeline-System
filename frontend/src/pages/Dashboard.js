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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dashboard-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 36px 40px;
    color: #0f172a;
  }

  /* ============================== */
  /* TITLE                          */
  /* ============================== */
  .page-title {
    font-family: 'Sora', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.4px;
    margin-bottom: 28px;
    position: relative;
    display: inline-block;
  }

  .page-title::after {
    content: '';
    position: absolute;
    left: 0; bottom: -6px;
    width: 36px; height: 3px;
    background: linear-gradient(90deg, #2563eb, #60a5fa);
    border-radius: 999px;
  }

  /* ============================== */
  /* TOP SECTION: 2x2 + CHART      */
  /* ============================== */
  .top-section {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
    margin-bottom: 24px;
    align-items: stretch;
  }

  /* ============================== */
  /* METRIC 2x2 GRID               */
  /* ============================== */
  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 14px;
  }

  .metric-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    box-shadow: 0 1px 4px rgba(37,99,235,0.04);
    min-height: 130px;
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #93c5fd);
    border-radius: 18px 18px 0 0;
  }

  .metric-card:hover {
    box-shadow: 0 8px 28px rgba(37,99,235,0.11);
    transform: translateY(-2px);
  }

  .metric-icon {
    width: 32px; height: 32px;
    border-radius: 9px;
    background: #eff6ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .metric-value {
    font-family: 'Sora', sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: #1e40af;
    line-height: 1;
  }

  .metric-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #64748b;
  }

  /* ============================== */
  /* CHART CARD (fills right)       */
  /* ============================== */
  .chart-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 26px 28px;
    box-shadow: 0 1px 4px rgba(37,99,235,0.04);
    display: flex;
    flex-direction: column;
  }

  .chart-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
    flex-shrink: 0;
  }

  .chart-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.2px;
  }

  .chart-area {
    flex: 1;
    min-height: 200px;
  }

  /* ============================== */
  /* PATIENT TABLE CARD             */
  /* ============================== */
  .table-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 28px 32px;
    box-shadow: 0 1px 4px rgba(37,99,235,0.04);
  }

  .table-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }

  .table-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.2px;
  }

  /* SEARCH */
  .search-input {
    padding: 9px 14px;
    border-radius: 10px;
    border: 1.5px solid #dbeafe;
    background: #f8faff;
    width: 260px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #0f172a;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }

  .search-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.09);
    background: #ffffff;
  }

  .search-input::placeholder { color: #94a3b8; }

  /* TABLE */
  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table thead tr { background: #f8faff; }

  .table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1.5px solid #e2e8f0;
  }

  .table th:first-child { border-radius: 10px 0 0 10px; }
  .table th:last-child  { border-radius: 0 10px 10px 0; }

  .table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #334155;
    transition: background 0.15s;
  }

  .table tbody tr:last-child td { border-bottom: none; }
  .table tbody tr:hover td { background: #f8faff; }
  .table tbody tr.high-risk td { background: #fff8f8; }

  /* BADGES */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .badge-high   { background: #fee2e2; color: #991b1b; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-low    { background: #dcfce7; color: #166534; }

  /* BUTTONS */
  .btn-open {
    padding: 7px 15px;
    border-radius: 9px;
    border: 1.5px solid #2563eb;
    background: #eff6ff;
    color: #2563eb;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  }

  .btn-open:hover {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }

  .btn-delete {
    padding: 7px 15px;
    border-radius: 9px;
    border: 1.5px solid #fca5a5;
    background: #fff5f5;
    color: #ef4444;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .btn-delete:hover {
    background: #ef4444;
    color: #ffffff;
  }

  /* SECTION TAG */
  .section-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }

  /* LOADING */
  .loading {
    padding: 40px;
    font-family: 'DM Sans', sans-serif;
    color: #64748b;
    font-size: 15px;
  }
`;

function Dashboard() {

  const [overview, setOverview] = useState(null);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOverview();
    fetchPatients();
  }, []);

  // ==============================
  // FETCH OVERVIEW
  // ==============================
  const fetchOverview = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/overview");
      setOverview(res.data);
    } catch (error) {
      console.error("Overview fetch error:", error);
    }
  };

  // ==============================
  // FETCH PATIENTS
  // ==============================
  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Patients fetch error:", error);
    }
  };

  // ==============================
  // DELETE PATIENT
  // ==============================
  const deletePatient = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      fetchPatients();
      fetchOverview();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ==============================
  // LOADING
  // ==============================
  if (!overview) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading">Loading...</div>
      </>
    );
  }

  // ==============================
  // FILTER PATIENTS
  // ==============================
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p._id.includes(search)
  );

  // ==============================
  // CHART DATA
  // ==============================
  const barData = {
    labels: Object.keys(overview.conditionDistribution || {}),
    datasets: [
      {
        data: Object.values(overview.conditionDistribution || {}),
        backgroundColor: "rgba(37,99,235,0.12)",
        borderColor: "#2563eb",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(37,99,235,0.28)"
      }
    ]
  };

  const metrics = [
    { title: "Total Patients",   value: overview.totalPatients,    icon: "👤" },
    { title: "Total Reports",    value: overview.totalReports,     icon: "📄" },
    { title: "Active Risks",     value: overview.totalRisks,       icon: "⚠️" },
    { title: "High Risk",        value: overview.highRiskPatients, icon: "🔴" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">

        <h1 className="page-title">Clinical Overview</h1>

        {/* ============================== */}
        {/* TOP SECTION                    */}
        {/* ============================== */}
        <div className="top-section">

          {/* LEFT: 2×2 METRIC GRID */}
          <div className="metric-grid">
            {metrics.map((m, i) => (
              <Metric key={i} title={m.title} value={m.value} icon={m.icon} />
            ))}
          </div>

          {/* RIGHT: CHART FILLS REMAINING WIDTH */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Condition Distribution</span>
              <span className="section-tag">Analytics</span>
            </div>
            <div className="chart-area">
              <Bar
                data={barData}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#1e40af",
                      titleColor: "#bfdbfe",
                      bodyColor: "#ffffff",
                      padding: 10,
                      cornerRadius: 8
                    }
                  },
                  scales: {
                    x: {
                      grid: { color: "#f1f5f9" },
                      ticks: { color: "#94a3b8", font: { size: 11 } }
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: "#64748b", font: { size: 12 } }
                    }
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* ============================== */}
        {/* PATIENT TABLE                  */}
        {/* ============================== */}
        <div className="table-card">

          <div className="table-card-header">
            <span className="table-card-title">Patient Registry</span>
            <input
              className="search-input"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p._id} className={p.riskScore > 7 ? "high-risk" : ""}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.contact}</td>
                  <td>
                    {p.riskScore > 7 ? (
                      <span className="badge badge-high">● High</span>
                    ) : p.riskScore > 4 ? (
                      <span className="badge badge-medium">● Moderate</span>
                    ) : (
                      <span className="badge badge-low">● Low</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link to={`/patients/${p._id}`}>
                        <button className="btn-open">Open</button>
                      </Link>
                      <button className="btn-delete" onClick={() => deletePatient(p._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </>
  );
}

/* ============================== */
/* METRIC COMPONENT               */
/* ============================== */
function Metric({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{title}</div>
    </div>
  );
}

export default Dashboard;