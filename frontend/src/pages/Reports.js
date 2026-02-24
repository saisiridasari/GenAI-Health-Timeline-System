import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Reports() {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [id]);

  const fetchReports = async () => {
    const res = await axios.get(`http://localhost:5000/api/reports/${id}`);
    setReports(res.data);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("report", file);

    await axios.post(`http://localhost:5000/api/reports/${id}`, formData);
    fetchReports();
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Patient Reports</h1>

      <div className="card">
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button className="btn-primary" type="submit" style={{ marginLeft: "10px" }}>
            Upload
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Uploaded Reports</h3>
        {reports.length === 0 ? (
          <p>No reports uploaded yet.</p>
        ) : (
          <ul>
            {reports.map((r) => (
              <li key={r._id} style={{ marginBottom: "10px" }}>
                <a
                  href={`http://localhost:5000/${r.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Reports;