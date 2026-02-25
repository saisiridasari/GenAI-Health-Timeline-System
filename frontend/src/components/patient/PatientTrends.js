import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function PatientTrends({ patientId }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchTrends();
  }, [patientId]);

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

  if (!analysis) return <div>Loading...</div>;

  const { labHistory, trendAnalysis } = analysis;
  const tests = Object.keys(labHistory || {});

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {tests.length === 0 ? (
        <div className="card">
          <p style={{ color: "#6b7280" }}>
            No lab trend data available.
          </p>
        </div>
      ) : (
        tests.map((test, index) => {
          const values = labHistory[test];

          const chartData = {
            labels: values.map(v =>
              new Date(v.date).toLocaleDateString()
            ),
            datasets: [
              {
                data: values.map(v => v.value),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37,99,235,0.15)",
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.4
              }
            ]
          };

          const trendText = trendAnalysis?.[test];

          return (
            <div key={index} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ textTransform: "capitalize", fontSize: "16px" }}>
                  {test}
                </h3>

                {trendText && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      background:
                        trendText.includes("Increasing")
                          ? "#dcfce7"
                          : trendText.includes("Decreasing")
                          ? "#fee2e2"
                          : "#e5e7eb",
                      color:
                        trendText.includes("Increasing")
                          ? "#166534"
                          : trendText.includes("Decreasing")
                          ? "#991b1b"
                          : "#374151",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    {trendText}
                  </span>
                )}
              </div>

              <div style={{ height: "180px" }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: {
                        grid: { display: false }
                      },
                      y: {
                        grid: { color: "#f3f4f6" }
                      }
                    }
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PatientTrends;