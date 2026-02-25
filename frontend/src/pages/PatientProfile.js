import { useParams } from "react-router-dom";
import { useState } from "react";
import PatientOverview from "../components/patient/PatientOverview";
import PatientTimeline from "../components/patient/PatientTimeline";
import PatientTrends from "../components/patient/PatientTrends";
import PatientEvolution from "../components/patient/PatientEvolution";

function PatientProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      <h1 className="page-title">Patient Intelligence</h1>

      <div className="tabs">
        <Tab name="overview" activeTab={activeTab} setActiveTab={setActiveTab}>
          Overview
        </Tab>
        <Tab name="timeline" activeTab={activeTab} setActiveTab={setActiveTab}>
          Timeline
        </Tab>
        <Tab name="trends" activeTab={activeTab} setActiveTab={setActiveTab}>
          Trends
        </Tab>
        <Tab name="evolution" activeTab={activeTab} setActiveTab={setActiveTab}>
          Evolution
        </Tab>
      </div>

      <div style={{ marginTop: "30px" }}>
        {activeTab === "overview" && <PatientOverview patientId={id} />}
        {activeTab === "timeline" && <PatientTimeline patientId={id} />}
        {activeTab === "trends" && <PatientTrends patientId={id} />}
        {activeTab === "evolution" && <PatientEvolution patientId={id} />}
      </div>
    </div>
  );
}

function Tab({ name, activeTab, setActiveTab, children }) {
  const isActive = activeTab === name;

  return (
    <button
      onClick={() => setActiveTab(name)}
      style={{
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        background: isActive ? "#2563eb" : "#e5e7eb",
        color: isActive ? "white" : "#111827",
        cursor: "pointer",
        fontWeight: "500"
      }}
    >
      {children}
    </button>
  );
}

export default PatientProfile;