import { Link, useLocation } from "react-router-dom";
import "../styles/layout.css";

// Requires in index.html <head>:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

const links = [
  { to: "/",    icon: "ti-layout-dashboard", label: "Dashboard"  },
  { to: "/add", icon: "ti-user-plus",        label: "Add Patient" },
];

function Sidebar({ isOpen }) {
  const { pathname } = useLocation();

  return (
    <div className={`sidebar${isOpen ? "" : " sidebar-closed"}`}>

      {/* LOGO */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="ti ti-dna-2" aria-hidden="true" />
        </div>
        {isOpen && <span className="sidebar-logo-text">Health Intelligence</span>}
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link${pathname === to ? " active" : ""}`}
            title={!isOpen ? label : undefined}
          >
            <i className={`ti ${icon} link-icon`} aria-hidden="true" />
            {isOpen && <span className="link-label">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* FOOTER */}
      {isOpen && (
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <div className="version-dot" />
            <span className="version-text">GenAI Engine v1.0</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default Sidebar;