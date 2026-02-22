import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Reports() {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/reports/${id}`
        );
        setReports(res.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("report", file);

    try {
      await axios.post(
        `http://localhost:5000/api/reports/${id}`,
        formData
      );

      // Refresh reports after upload
      const res = await axios.get(
        `http://localhost:5000/api/reports/${id}`
      );
      setReports(res.data);

    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Reports</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload</button>
      </form>

      <ul>
        {reports.map((r) => (
          <li key={r._id}>
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
    </div>
  );
}

export default Reports;