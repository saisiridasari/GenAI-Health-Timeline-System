import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddPatient from "./pages/AddPatient";
import Reports from "./pages/Reports";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddPatient />} />
        <Route path="/reports/:id" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;