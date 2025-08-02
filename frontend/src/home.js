import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css"; // Make sure this CSS file is present in the same folder

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setData(null);
  };

  useEffect(() => {
    const upload = async () => {
      if (!selectedFile) return;
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_URL,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.status === 200) setData(response.data);
      } catch (err) {
        console.error("Upload error", err);
      } finally {
        setLoading(false);
      }
    };
    upload();
  }, [selectedFile]);

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setData(null);
  };

  return (
    <div className="container">
      <header className="header">🍃 Potato Leaf Disease Classifier</header>

      {!preview && (
        <div className="upload-box">
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <label htmlFor="fileInput" className="upload-btn">
            <i className="fas fa-upload"></i> Upload Leaf Image
          </label>
          <p>Click the button to upload a potato leaf image</p>
        </div>
      )}

      {preview && (
        <div className="preview-card">
          <img src={preview} alt="Uploaded" className="preview-img" />
          <div className="prediction">
            {loading ? (
              <p className="loading">
                <i className="fas fa-spinner fa-spin"></i> Analyzing...
              </p>
            ) : data ? (
              <>
                <p>
                  <strong>Prediction:</strong> {data.class}
                </p>
                <p>
                  <strong>Confidence:</strong>{" "}
                  {(parseFloat(data.confidence) * 100).toFixed(2)}%
                </p>
              </>
            ) : (
              <p>Waiting for prediction...</p>
            )}
          </div>
          <button className="clear-btn" onClick={handleClear}>
            <i className="fas fa-trash"></i> Clear
          </button>
        </div>
      )}
    </div>
  );
};
