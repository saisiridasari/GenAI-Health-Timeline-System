import { useEffect, useState } from "react";
import axios from "axios";

function PatientTimeline({ patientId }) {

  const [groupedTimeline, setGroupedTimeline] = useState({});
  const [openDate, setOpenDate] = useState(null);

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  // ==============================
  // FETCH TIMELINE
  // ==============================
  const fetchTimeline = async () => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/reports/${patientId}`
      );

      let allTimeline = [];

      res.data.forEach((report) => {

        if (
          report.extractedData &&
          report.extractedData.timeline
        ) {

          allTimeline = [
            ...allTimeline,
            ...report.extractedData.timeline
          ];
        }
      });

      // ==============================
      // GROUP EVENTS BY DATE
      // ==============================
      const grouped = {};

      allTimeline.forEach((item) => {

        if (!grouped[item.date]) {
          grouped[item.date] = [];
        }

        grouped[item.date].push(item.event);

      });

      setGroupedTimeline(grouped);

    } catch (error) {

      console.error("Timeline fetch error:", error);

    }
  };

  // ==============================
  // SORT DATES
  // ==============================
  const sortedDates = Object.keys(groupedTimeline).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div>

      <h2 style={{ marginBottom: "20px" }}>
        Clinical Timeline
      </h2>

      {sortedDates.length === 0 ? (

        <div className="card">
          No timeline events available.
        </div>

      ) : (

        sortedDates.map((date, index) => (

          <div
            key={index}
            className="card"
            style={{
              marginBottom: "14px",
              padding: "18px"
            }}
          >

            {/* HEADER */}
            <div
              onClick={() =>
                setOpenDate(
                  openDate === date
                    ? null
                    : date
                )
              }
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "5px"
                  }}
                >
                  Clinical Visit Date
                </div>

                <strong>{date}</strong>

              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "500",
                  color: "#2563eb"
                }}
              >
                {openDate === date ? "−" : "+"}
              </div>

            </div>

            {/* EXPANDABLE BODY */}
            {openDate === date && (

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e5e7eb"
                }}
              >

                {groupedTimeline[date].map(
                  (event, idx) => (

                    <div
                      key={idx}
                      style={{
                        padding: "12px 0",
                        borderBottom:
                          "1px solid #f3f4f6",
                        color: "#374151"
                      }}
                    >
                      • {event}
                    </div>

                  )
                )}

              </div>

            )}

          </div>

        ))

      )}

    </div>
  );
}

export default PatientTimeline;