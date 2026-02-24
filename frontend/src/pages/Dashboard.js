import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const res = await axios.get("http://localhost:5000/api/patients");
    setPatients(res.data);
  };

  const deletePatient = async (id) => {
    await axios.delete(`http://localhost:5000/api/patients/${id}`);
    fetchPatients();
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Patient Dashboard</h1>

      <Link to="/add">
        <button className="btn-primary" style={{ marginBottom: "20px" }}>
          Add New Patient
        </button>
      </Link>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.contact}</td>
                <td>
                  <Link to={`/reports/${patient._id}`}>
                    <button className="btn-secondary">Reports</button>
                  </Link>

                  <Link to={`/trends/${patient._id}`}>
                    <button className="btn-primary" style={{ marginLeft: "8px" }}>
                      Trends
                    </button>
                  </Link>

                  <button
                    className="btn-danger"
                    style={{ marginLeft: "8px" }}
                    onClick={() => deletePatient(patient._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;