import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/layout.css";

function Layout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <Header />

        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;