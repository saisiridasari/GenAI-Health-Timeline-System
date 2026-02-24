import "../styles/layout.css";

function Header() {
  return (
    <div className="header">
      <div>
        <div className="header-title">Clinical Intelligence Platform</div>
        <div className="header-subtitle">
          Longitudinal Health Analytics System
        </div>
      </div>

      <div style={{ fontSize: "14px", color: "#6b7280" }}>
        GenAI Health Engine v1.0
      </div>
    </div>
  );
}

export default Header;