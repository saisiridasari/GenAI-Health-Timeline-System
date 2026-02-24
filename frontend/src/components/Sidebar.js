import { Link } from "react-router-dom";
import "../styles/layout.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-title">Health Intelligence</div>

      <Link to="/" className="sidebar-link">
        Dashboard
      </Link>

      <Link to="/add" className="sidebar-link">
        Add Patient
      </Link>
    </div>
  );
}

export default Sidebar;