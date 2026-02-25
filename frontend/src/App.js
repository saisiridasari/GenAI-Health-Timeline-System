import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AddPatient from "./pages/AddPatient";
import Reports from "./pages/Reports";
import PatientTrends from "./pages/PatientTrends";
import PatientProfile from "./pages/PatientProfile";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddPatient />} />
          <Route path="/reports/:id" element={<Reports />} />
          <Route path="/trends/:id" element={<PatientTrends />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;