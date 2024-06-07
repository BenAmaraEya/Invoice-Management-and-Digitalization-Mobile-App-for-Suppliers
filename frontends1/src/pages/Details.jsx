import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import { FaFilePdf } from 'react-icons/fa';
import '../styles/Details.css'; // Import your CSS file for styling

const Details = () => {
  const { idF } = useParams();
  const [facture, setFacture] = useState({
    num_fact: '',
    num_po: '',
    date_fact: '',
    montant: '',
    factname: '',
    devise: 'TND',
    nature: '',
    objet: '',
    datereception: '',
    pathpdf: '',
    piece_name: [],
    etat: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3006/facture/facturebyId/${idF}`);
        setFacture(response.data.facture);
      } catch (error) {
        console.error('Erreur de récuperation de facture:', error);
      }
    };

    if (idF) {
      fetchData();
    }
  }, [idF]);

  const viewFacturePDF = async (pathpdf) => {
    try {
      const response = await axios.get(`http://localhost:3006/facture/view-pdf/${pathpdf}`, {
        responseType: 'blob'
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);
    } catch (error) {
      console.error('Erreur d overture de PDF:', error);
    }
  };

  return (
    <div className="details-container">
    
      <table className="details-table">
        <thead>
          <tr>
            <th colSpan="8" style={{textAlign:'center',color:'#3b1b0d'}}>Details Facture {facture.idF}</th>
          </tr>
          <tr style={{color:'#3b1b0d'}}>
            <th>Numéro Facture</th>
            <th>Nature</th>
            <th>Date Facture</th>
            <th>Numéro de bon commande</th>
            <th>Montant</th>
            <th>Devise</th>
            <th>Date de Réception</th>
            <th>View PDF</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{facture.num_fact}</td>
            <td>{facture.nature}</td>
            <td>{facture.date_fact}</td>
            <td>{facture.num_po}</td>
            <td>{facture.montant}</td>
            <td>{facture.devise}</td>
            <td>{facture.datereception}</td>
            <td>
              <Button onClick={() => viewFacturePDF(facture.pathpdf)} className="pdf"><FaFilePdf/></Button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="details-section">
       
        <table className="pieces-jointes-table">
          <thead>
            <tr>
            <th colSpan="2" style={{textAlign:'center',color:'#3b1b0d'}}>
            Pieces Jointes
            </th>
            </tr>
           
            <tr style={{color:'#3b1b0d'}}>
              <th>Numéro</th>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {facture.Pieces_jointes && facture.Pieces_jointes.map((piece, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{piece.piece_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="details-section">
        
        <table className="historique-table">
          <thead>
            <tr>
              <th colSpan="2" style={{textAlign:'center',color:'#3b1b0d'}}>
              Historique Etat du Facture
              </th>
            </tr>
            <tr style={{color:'#3b1b0d'}}>
              <th>État</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {facture.Etats && facture.Etats.map((etat, index) => (
              <tr key={index}>
                <td>{etat.etat}</td>
                <td>{etat.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
