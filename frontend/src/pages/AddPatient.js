import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = `
  .ap-page { max-width: 900px; }

  .ap-page-header { margin-bottom: 28px; }
  .ap-page-title { font-size: 22px; font-weight: 600; color: #111827; letter-spacing: -0.02em; margin-bottom: 4px; }
  .ap-page-sub { font-size: 13.5px; color: #9ca3af; font-weight: 400; }

  .ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  .ap-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 24px; }

  .ap-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .ap-card-icon { width: 38px; height: 38px; min-width: 38px; background: #EEF3FF; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #3B5BDB; font-size: 20px; }
  .ap-card-title { font-size: 14px; font-weight: 600; color: #111827; }
  .ap-card-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }

  .ap-fields { display: flex; flex-direction: column; gap: 16px; }
  .ap-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ap-field { display: flex; flex-direction: column; gap: 6px; }
  .ap-label { font-size: 12.5px; font-weight: 500; color: #374151; letter-spacing: 0.01em; }

  .ap-input-wrap { position: relative; display: flex; align-items: center; }
  .ap-input-icon { position: absolute; left: 11px; font-size: 16px; color: #9ca3af; pointer-events: none; z-index: 1; }

  .ap-input { width: 100%; height: 40px; padding: 0 12px 0 36px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 13.5px; color: #111827; background: #ffffff; outline: none; font-family: inherit; transition: border-color 0.16s ease, box-shadow 0.16s ease; appearance: none; -webkit-appearance: none; }
  .ap-input::placeholder { color: #c4c9d4; }
  .ap-input:focus { border-color: #3B5BDB; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }

  .ap-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

  .ap-dropzone { border: 2px dashed rgba(0,0,0,0.1); border-radius: 12px; padding: 32px 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease; min-height: 200px; }
  .ap-dropzone:hover { border-color: #3B5BDB; background: #f8f9ff; }
  .ap-dropzone.dragging { border-color: #3B5BDB; background: #EEF3FF; }
  .ap-dropzone.has-file { border-style: solid; border-color: rgba(34,197,94,0.4); background: #f0fdf4; }

  .ap-dropzone-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
  .ap-drop-icon { width: 52px; height: 52px; background: #EEF3FF; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #3B5BDB; margin-bottom: 8px; }
  .ap-drop-title { font-size: 14px; font-weight: 500; color: #374151; }
  .ap-drop-sub { font-size: 12.5px; color: #9ca3af; }
  .ap-drop-types { margin-top: 10px; font-size: 11px; font-weight: 600; color: #9ca3af; letter-spacing: 0.08em; text-transform: uppercase; background: #f3f4f6; padding: 4px 12px; border-radius: 100px; }

  .ap-file-preview { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
  .ap-file-icon { width: 48px; height: 48px; background: #f0fdf4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #22c55e; margin-bottom: 6px; }
  .ap-file-name { font-size: 13.5px; font-weight: 500; color: #111827; word-break: break-all; max-width: 200px; }
  .ap-file-size { font-size: 12px; color: #9ca3af; }
  .ap-file-remove { margin-top: 8px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 12px; cursor: pointer; transition: background 0.15s ease; font-family: inherit; }
  .ap-file-remove:hover { background: #fee2e2; }

  .ap-actions { display: flex; justify-content: flex-end; gap: 10px; }

  .ap-btn-primary { display: flex; align-items: center; gap: 7px; height: 40px; padding: 0 20px; background: #3B5BDB; color: #ffffff; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; font-family: inherit; transition: background 0.16s ease, opacity 0.16s ease; }
  .ap-btn-primary:hover { background: #3451c7; }
  .ap-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .ap-btn-secondary { display: flex; align-items: center; gap: 7px; height: 40px; padding: 0 20px; background: #ffffff; color: #6b7280; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; font-family: inherit; transition: background 0.16s ease, color 0.16s ease; }
  .ap-btn-secondary:hover { background: #f3f4f6; color: #111827; }

  @keyframes ap-spin { to { transform: rotate(360deg); } }
  .ap-spin { display: inline-block; animation: ap-spin 0.7s linear infinite; }
`;

function AddPatient() {
  const [form, setForm] = useState({ name: "", age: "", gender: "", contact: "" });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patientRes = await axios.post("http://localhost:5000/api/patients", form);
      const patientId = patientRes.data._id;
      if (file) {
        const formData = new FormData();
        formData.append("report", file);
        await axios.post(`http://localhost:5000/api/reports/${patientId}`, formData);
      }
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="ap-page">

        {/* Page Header */}
        <div className="ap-page-header">
          <h1 className="ap-page-title">Add New Patient</h1>
          <p className="ap-page-sub">Fill in the details below to register a new patient record</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ap-grid">

            {/* LEFT — Patient Info */}
            <div className="ap-card">
              <div className="ap-card-header">
                <div className="ap-card-icon">
                  <i className="ti ti-user-circle" aria-hidden="true" />
                </div>
                <div>
                  <div className="ap-card-title">Patient Information</div>
                  <div className="ap-card-sub">Basic demographic details</div>
                </div>
              </div>

              <div className="ap-fields">

                <div className="ap-field">
                  <label className="ap-label">Full Name</label>
                  <div className="ap-input-wrap">
                    <i className="ti ti-user ap-input-icon" aria-hidden="true" />
                    <input
                      className="ap-input"
                      placeholder="e.g. James Mitchell"
                      value={form.name}
                      onChange={handleChange("name")}
                      required
                    />
                  </div>
                </div>

                <div className="ap-row">
                  <div className="ap-field">
                    <label className="ap-label">Age</label>
                    <div className="ap-input-wrap">
                      <i className="ti ti-calendar ap-input-icon" aria-hidden="true" />
                      <input
                        className="ap-input"
                        placeholder="e.g. 45"
                        type="number"
                        min="0"
                        max="150"
                        value={form.age}
                        onChange={handleChange("age")}
                        required
                      />
                    </div>
                  </div>

                  <div className="ap-field">
                    <label className="ap-label">Gender</label>
                    <div className="ap-input-wrap">
                      <i className="ti ti-gender-bigender ap-input-icon" aria-hidden="true" />
                      <select
                        className="ap-input ap-select"
                        value={form.gender}
                        onChange={handleChange("gender")}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="ap-field">
                  <label className="ap-label">Contact Number</label>
                  <div className="ap-input-wrap">
                    <i className="ti ti-phone ap-input-icon" aria-hidden="true" />
                    <input
                      className="ap-input"
                      placeholder="e.g. +91 9876543210"
                      value={form.contact}
                      onChange={handleChange("contact")}
                      required
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT — Upload Report */}
            <div className="ap-card">
              <div className="ap-card-header">
                <div className="ap-card-icon">
                  <i className="ti ti-file-text" aria-hidden="true" />
                </div>
                <div>
                  <div className="ap-card-title">Upload Report</div>
                  <div className="ap-card-sub">PDF or Word documents accepted</div>
                </div>
              </div>

              <div
                className={`ap-dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />

                {file ? (
                  <div className="ap-file-preview">
                    <div className="ap-file-icon">
                      <i className="ti ti-file-check" aria-hidden="true" />
                    </div>
                    <div className="ap-file-name">{file.name}</div>
                    <div className="ap-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    <button
                      type="button"
                      className="ap-file-remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <i className="ti ti-x" aria-hidden="true" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="ap-dropzone-empty">
                    <div className="ap-drop-icon">
                      <i className="ti ti-cloud-upload" aria-hidden="true" />
                    </div>
                    <div className="ap-drop-title">Drag & drop your file here</div>
                    <div className="ap-drop-sub">or click to browse</div>
                    <div className="ap-drop-types">PDF · DOC · DOCX</div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="ap-actions">
            <button type="button" className="ap-btn-secondary" onClick={() => navigate("/")}>
              Cancel
            </button>
            <button type="submit" className="ap-btn-primary" disabled={loading}>
              {loading ? (
                <><i className="ti ti-loader-2 ap-spin" aria-hidden="true" /> Saving…</>
              ) : (
                <><i className="ti ti-device-floppy" aria-hidden="true" /> Save Patient</>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default AddPatient;