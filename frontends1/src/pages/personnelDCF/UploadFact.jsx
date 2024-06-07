import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate,Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import '../../styles/factureform.css';

const UploadFacture = () => {
  const navigate = useNavigate();
  const { nature,iderp } = useParams(); 
  const id = localStorage.getItem("userId");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [facture, setFacture] = useState({
    num_fact: '',
    num_po: '',
    date_fact: '',
    montant: '',
    factname: '',
    devise: 'TND',
    nature: nature || '', 
    objet: 'NOUVELLE FACTURE',
    datereception: new Date().toISOString().split('T')[0],
    pathpdf: '',
    idfiscale: '',
    fournisseur: '',
    iderp: '',
    piece_name: [], 
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'iderp') {
      setFacture(prevFacture => ({
        ...prevFacture,
        iderp: value,
      }));
      informationFournisseur(value);
    } else if (name === 'piece_name') {
      const isChecked = facture.piece_name.includes(value);
      setFacture(prevFacture => ({
        ...prevFacture,
        piece_name: isChecked ? prevFacture.piece_name.filter(item => item !== value) : [...prevFacture.piece_name, value],
      }));
    } else {
      setFacture(prevFacture => ({
        ...prevFacture,
        [name]: value,
      }));
    }
  };

  const informationFournisseur = async (iderp) => {
    try {
      const result = await axios.get(`http://localhost:3006/fournisseur/${iderp}`);
      const fournisseurIdFiscal = result.data.fournisseur.idfiscale;
      const fournisseur = result.data.fournisseur.User.name;
      
      setFacture(prevFacture => ({
        ...prevFacture,
        idfiscale: fournisseurIdFiscal,
        fournisseur: fournisseur,
      }));
    } catch (error) {
      console.error('Error fetching fournisseur:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`http://localhost:3006/facture/save/${facture.iderp}`, {
        ...facture,
        status: "courrier validé par BOF"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

    
      const factureId = response.data.facture.idF;

      await axios.post('http://localhost:3006/piecejoint/addpiece', {
        piece_name: facture.piece_name,
        idFacture: factureId,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      );
      alert('Facture and pieces jointes save successfully');
      navigate(`/listcourriers/${facture.iderp}`);
    } catch (error) {
      console.error('Error save facture and pieces jointes:', error);
      alert('Failed to save facture and pieces jointes');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  const changeDocuments = async () => {
    try {
      const formData = new FormData();
      formData.append('factureFile', file);
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3006/facture/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      const extractedInfo = response.data.extractedInfo;
      const filePath = `uploads/${fileName}`;

      setFacture(prevFacture => ({
        ...prevFacture,
        num_fact: extractedInfo.num_fact || '',
        num_po: extractedInfo.num_po || '',
        date_fact: extractedInfo.date_fact || '',
        montant: extractedInfo.montant || '',
        factname: extractedInfo.factname || '',
        devise: extractedInfo.devise || 'TND',
        nature: extractedInfo.nature || nature || '', // Set nature to the extracted value, or the default value provided by useParams
        objet: extractedInfo.objet || 'NOUVELLE FACTURE',
        datereception: extractedInfo.datereception || '',
        pathpdf: filePath || '',
      }));
    } catch (error) {
      console.error('Error uploading facture:', error);
    }
  };

  return (
    <section>
    <Container>
      <Row>
        <Col lg="8" className="m-auto">
    
      <h1>Ajouter Facture </h1>
      <div className="facture-container d-flex justify-content-between">
              <div className="facture-form">
      <form onSubmit={handleSubmit}>
      <Row>
                    <Col md="6">
                    <FormGroup>
                        <label className="facture-label">iderp:*</label>
                        <input className="facture-input" type="text" name="iderp" value={facture.iderp} onChange={handleChange} />
                      </FormGroup>
                    <FormGroup>
                        <label className="facture-label">fournisseur:*</label>
                        <input className="facture-input" type="text" name="name" value={facture.fournisseur} onChange={handleChange} disabled  />
                      </FormGroup>
                      <FormGroup>
                        <label className="facture-label">ID Fiscale :*</label>
                        <input className="facture-input" type="text" name="idfiscale" value={facture.idfiscale} onChange={handleChange} disabled />
                      </FormGroup>
        <FormGroup>
        <label>
          Numéro de Facture:
          <input type="text" name="num_fact" value={facture.num_fact} onChange={handleChange} required />
        </label>
        </FormGroup>
                      <FormGroup>
        <label>
          Numéro PO:
          <input type="text" name="num_po" value={facture.num_po} onChange={handleChange} />
        </label>
        </FormGroup>
        <FormGroup>
                        <label className="facture-label">Date de facture:*</label>
                        <input className="facture-input" type="date" name="date_fact" value={facture.date_fact} onChange={handleChange} required />
                      </FormGroup>
        <FormGroup>
        <label>
          Montant:
          <input type="number" name="montant" value={facture.montant} onChange={handleChange} required />
        </label>
        </FormGroup>
        </Col>
                    <Col md="6">
                      <FormGroup>
        <label>
          Nom de Facture:
          <input type="text" name="factname" value={facture.factname} onChange={handleChange} required />
        </label>
        </FormGroup>
        
                      <FormGroup>
        <label>
          Devise:
          <select name="devise" value={facture.devise} onChange={handleChange} required>
            <option value="TND">TND</option>
            <option value="EURO">EURO</option>
            <option value="USD">USD</option>
          </select>
        </label>
        </FormGroup>
        
                      <FormGroup>
        <label>
          Nature:
          <input type="text" name="nature" value={facture.nature} onChange={handleChange} required />
        </label>
        </FormGroup>
        <FormGroup>
                        <label className="facture-label">Object:*</label>
                        <select className="facture-input" name="objet" value={facture.objet} onChange={handleChange} required>
                          <option value="NOUVELLE FACTURE">Nouvelle Facture</option>
                          <option value="ancien facture">Ancien Facture</option>
                        </select>
                      </FormGroup>
        
                   
                      <FormGroup>
  <label>
    Pièces Jointes :
    <div>
      <label>
        <input
          type="checkbox"
          name="piece_name"
          value="bon de command"
          checked={facture.piece_name.includes('bon de command')}
          onChange={handleChange}
        />
        Bon de Commande
      </label>
    </div>
    <div>
      <label>
        <input
          type="checkbox"
          name="piece_name"
          value="pv de reception"
          checked={facture.piece_name.includes('pv de reception')}
          onChange={handleChange}
        />
        PV de Reception
      </label>
    </div>
  </label>
</FormGroup>

                      <FormGroup>
   
        <label>
          télécharge Courriers*:
          <input type="file" onChange={handleFileChange} accept=".pdf" />
          <button className="upload-btn" onClick={changeDocuments}>
             télécharge
          </button>
        </label>
        </FormGroup>
        </Col>
                  </Row>
                  <div className='btn-container' style={{marginLeft:'40%'}}>
        <button type="submit">Valider</button>
       
        </div>
      </form>
      </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default UploadFacture;
