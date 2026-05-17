import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;