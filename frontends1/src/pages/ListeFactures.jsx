import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import axios from 'axios';
import { FaFileExcel, FaPlus, FaEye, FaTrashAlt, FaEdit, FaSearch, FaFilePdf } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import './../styles/listefacture.css';
//pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ListeFactures = () => {
  const [factures, setFactures] = useState([]);
  const [iderp, setIdErp] = useState(null);
  const [pdfPath, setPdfPath] = useState(null);
  const [searchParams, setSearchParams] = useState({ num_fact: '', datereception: '' });

  useEffect(() => {
    const fetchFournisseurByUserId = async () => {
      try {
        const id = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:3006/fournisseur/userId/${id}`);
        const iderpFromResponse = response.data.fournisseur.iderp;
        setIdErp(iderpFromResponse);
      } catch (error) {
        console.error('Erreur de récuperation de  fournisseur:', error);
      }
    };

    fetchFournisseurByUserId();
  }, []);

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        if (iderp) {
          const response = await axios.get(`http://localhost:3006/facture/${iderp}`);
          const factures = response.data.factures;
          const facturesNonCloturees = factures.filter(facture => !facture.Etats.some(etat => etat.etat === 'cloture'));
          setFactures(facturesNonCloturees);
        }
      } catch (error) {
        console.error('Erreur de recuperation de factures:', error);
      }
    };

    fetchFactures();
  }, [iderp]);

  const deleteFacture = async (fournisseurId, factureId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`http://localhost:3006/facture/fournisseur/${fournisseurId}/facture/${factureId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setFactures(factures.filter(facture => facture.idF !== factureId));
        alert('Facture supprimé avec succeé.');
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  const viewFacturePDF = async (pathpdf) => {
    try {
      const response = await axios.get(`http://localhost:3006/facture/view-pdf/${pathpdf}`, {
        responseType: 'blob'
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);
    } catch (error) {
      console.error('Erreur d ouverture de PDF :', error);
    }
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3006/facture/export', {
        factures: factures,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'factures.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Erreur d exportation d excel:', error);
    }
  };

  const rechercheFacture = async () => {
    try {
      const response = await axios.get('http://localhost:3006/facture/recherche/ParDATEetNUM', {
        params: searchParams
      });
      if (response.data) {
        setFactures([response.data]);
      }
    } catch (error) {
      console.error('Error searching for facture:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div>
      <div className="btns d-flex align-item-center justify-content-end">
        <button onClick={exportToExcel} className="export-btn"><FaFileExcel /> Export Factures</button>
        <Link to='/uploadfacture'>
          <Button className='ajouter-btn'><FaPlus style={{ marginRight: '5px' }} /> Ajouter Factures</Button>
        </Link>
      </div>

      <table className="factures-table">
        <thead>
          <tr className="table-header">
            <th colSpan="10">Liste Factures</th>
          </tr>
          <tr>
            <td colSpan="10" className="search-row">
              <div className="search-container">
                <input
                  type="text"
                  name="num_fact"
                  placeholder="Numéro Facture"
                  value={searchParams.num_fact}
                  onChange={handleInputChange}
                  className="search-input"
                />
                <input
                  type="date"
                  name="datereception"
                  placeholder="Date de Réception (yyyy-mm-dd)"
                  value={searchParams.datereception}
                  onChange={handleInputChange}
                  className="search-input"
                />
                <button onClick={rechercheFacture} className="search-btn"><FaSearch /></button>
              </div>
            </td>
          </tr>
          <tr className="table-subheader">
            <th>Facture ID</th>
            <th>Numéro Facture</th>
            <th>Facture Name</th>
            <th>Montant</th>
            <th>Status</th>
            <th>Numéro PO</th>
            <th>Date Facture</th>
            <th>Action</th>
            <th>PDF</th>
            <th>Etat</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((facture) => (
            <tr
              key={facture.idF}
              className={
                facture.status.includes('rejeté') ? '' :
                facture.status.includes('courriervalidé') ? '' : ''
              }
            >
              <td>{facture.idF}</td>
              <td>{facture.num_fact}</td>
              <td>{facture.factname}</td>
              <td>{facture.montant}</td>
              <td>{facture.status}</td>
              <td>{facture.num_po}</td>
              <td>{facture.date_fact}</td>
              <td>
                <button onClick={() => deleteFacture(facture.iderp, facture.idF)} style={{ background: 'none', border: 'none' }}>
                  <FaTrashAlt className='delete-btn' style={{ fontSize: '20px', backgroundColor: 'transparent', color: 'black' }} />
                </button>
                {(facture.status === 'Attente' || facture.status.includes('Manque')) && (
                  <Link to={`/updatefacture/${facture.idF}`}>
                    <FaEdit className='edit' color="black" style={{ fontSize: '20px', marginLeft: '5px' }} />
                  </Link>
                )}
              </td>
              <td>
                <button onClick={() => viewFacturePDF(facture.pathpdf)} className="pdf-file"><FaFilePdf /></button>
              </td>
              <td>
                <Link to={`/infographic/${facture.idF}`}>
                  <FaEye className='view-etat' color="black" style={{ fontSize: '20px' }} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pdfPath && (
        <Document file={pdfPath} error="PDF loading error">
          <Page pageNumber={1} />
        </Document>
      )}
    </div>
  );
};

export default ListeFactures;
