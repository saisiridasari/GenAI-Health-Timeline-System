import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddPatient() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    contact: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/patients", form);
    navigate("/");
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Add New Patient</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            className="input-field"
            placeholder="Full Name"
            onChange={e => setForm({...form, name: e.target.value})}
            required
          />

          <input
            className="input-field"
            placeholder="Age"
            type="number"
            onChange={e => setForm({...form, age: e.target.value})}
            required
          />

          <input
            className="input-field"
            placeholder="Gender"
            onChange={e => setForm({...form, gender: e.target.value})}
            required
          />

          <input
            className="input-field"
            placeholder="Contact"
            onChange={e => setForm({...form, contact: e.target.value})}
            required
          />

          <button className="btn-primary" type="submit">
            Save Patient
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPatient;