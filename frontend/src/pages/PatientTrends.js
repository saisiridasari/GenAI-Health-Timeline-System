import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

import "../styles/PatientTrends.css";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

const PatientTrends = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/patients/trends/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!data) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Patient Clinical Dashboard</h1>

      {/* Lab Trends */}
      <div className="card">
        <h2 className="section-title">Lab Trends</h2>

        {Object.keys(data.labHistory).map((test) => {
          const labels = data.labHistory[test].map((entry) =>
            new Date(entry.date).toLocaleDateString()
          );

          const values = data.labHistory[test].map((entry) => entry.value);

          const chartData = {
            labels,
            datasets: [
              {
                label: test.toUpperCase(),
                data: values,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                tension: 0.3,
              },
            ],
          };

          return (
            <div key={test} className="chart-wrapper">
              <Line data={chartData} />
            </div>
          );
        })}
      </div>

      {/* Risk Alerts */}
      <div className="card">
        <h2 className="section-title">Risk Alerts</h2>

        {data.riskFlags.length === 0 ? (
          <p>No active risks detected.</p>
        ) : (
          data.riskFlags.map((risk, index) => (
            <div key={index} className="risk-badge">
              {risk}
            </div>
          ))
        )}
      </div>

      {/* Clinical Summary */}
      <div className="card">
        <h2 className="section-title">Clinical Summary</h2>
        <div className="summary-box">{data.summary}</div>
      </div>
    </div>
  );
};

export default PatientTrends;