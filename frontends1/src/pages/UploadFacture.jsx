import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './../styles/uploadfacture.css'; 

function FactureUploader() {
  const navigate = useNavigate();
  const { nature } = useParams();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('factureFile', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3006/facture/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const filePath = `uploads/${fileName}`;
      //transmettre des données a la  route de navigation
      navigate('/facture-form', { state: { extractedInfo: response.data.extractedInfo, filePath: filePath } });
    } catch (error) {
      setError('Error uploading facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="facture-uploader-container">
      <h4>télecharger Documents</h4>
      
      <div className="file-input-container">
      <input className="input" type="file" accept=".pdf" onChange={handleFileChange} />
        <p>Une seule page doit être téléchargée sous la forme PDF</p>
        <p>Max 50 Mo</p>
      </div>
      
      <button className="upload-btn" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default FactureUploader;
