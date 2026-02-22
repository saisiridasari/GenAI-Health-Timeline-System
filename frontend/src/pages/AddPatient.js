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
    <form onSubmit={handleSubmit}>
      <h2>Add Patient</h2>
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Age" onChange={e => setForm({...form, age: e.target.value})} />
      <input placeholder="Gender" onChange={e => setForm({...form, gender: e.target.value})} />
      <input placeholder="Contact" onChange={e => setForm({...form, contact: e.target.value})} />
      <button type="submit">Submit</button>
    </form>
  );
}

export default AddPatient;