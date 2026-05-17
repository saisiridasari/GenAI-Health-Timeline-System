import "../styles/layout.css";

function Header({ onToggleSidebar, sidebarOpen }) {
  return (
    <div className="header">

      <div className="header-left">
        {/* Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}`} aria-hidden="true" />
        </button>

        <div>
          <div className="header-title">Clinical Intelligence Platform</div>
          <div className="header-subtitle">Longitudinal Health Analytics System</div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-badge">
          <div className="header-badge-dot" />
          <span className="header-badge-text">GenAI Health Engine v1.0</span>
        </div>
      </div>

    </div>
  );
}

export default Header;