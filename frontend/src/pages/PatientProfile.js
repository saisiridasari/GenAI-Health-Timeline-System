import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import PatientOverview from "../components/patient/PatientOverview";
import PatientTimeline from "../components/patient/PatientTimeline";
import PatientTrends from "../components/patient/PatientTrends";
import PatientEvolution from "../components/patient/PatientEvolution";

function PatientProfile() {

  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [file, setFile] = useState(null);

  // ==============================
  // UPLOAD NEW REPORT
  // ==============================
  const uploadReport = async (e) => {

    e.preventDefault();

    if (!file) {
      alert("Select a file first");
      return;
    }

    try {

      const formData = new FormData();

      formData.append("report", file);

      await axios.post(
        `http://localhost:5000/api/reports/${id}`,
        formData
      );

      alert("✅ Report uploaded successfully");

      setFile(null);

      // refresh page
      window.location.reload();

    } catch (error) {

      console.error("Upload error:", error);

      alert("❌ Upload failed");

    }
  };

  return (
    <div>

      <h1 className="page-title">Patient Intelligence</h1>

      {/* ============================== */}
      {/* UPLOAD CARD */}
      {/* ============================== */}
      <div
        className="card"
        style={{
          marginBottom: "25px",
          padding: "25px"
        }}
      >

        <h3 style={{ marginBottom: "18px" }}>
          Upload New Clinical Report
        </h3>

        <form
          onSubmit={uploadReport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}
        >

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn-primary"
            type="submit"
          >
            Upload Report
          </button>

        </form>

      </div>

      {/* ============================== */}
      {/* TABS */}
      {/* ============================== */}
      <div className="tabs">

        <Tab
          name="overview"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          Overview
        </Tab>

        <Tab
          name="timeline"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          Timeline
        </Tab>

        <Tab
          name="trends"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          Trends
        </Tab>

        <Tab
          name="evolution"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          Evolution
        </Tab>

      </div>

      {/* ============================== */}
      {/* TAB CONTENT */}
      {/* ============================== */}
      <div style={{ marginTop: "30px" }}>

        {activeTab === "overview" && (
          <PatientOverview patientId={id} />
        )}

        {activeTab === "timeline" && (
          <PatientTimeline patientId={id} />
        )}

        {activeTab === "trends" && (
          <PatientTrends patientId={id} />
        )}

        {activeTab === "evolution" && (
          <PatientEvolution patientId={id} />
        )}

      </div>

    </div>
  );
}

function Tab({
  name,
  activeTab,
  setActiveTab,
  children
}) {

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
        fontWeight: "500",
        marginRight: "10px"
      }}
    >
      {children}
    </button>
  );
}

export default PatientProfile;