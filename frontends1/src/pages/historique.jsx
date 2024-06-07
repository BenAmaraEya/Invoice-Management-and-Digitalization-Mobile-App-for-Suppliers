import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import './../styles/historique.css';
import { FaTrash, FaPen, FaSearch, FaFilePdf } from 'react-icons/fa';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Historique = () => {
    const [factures, setFactures] = useState([]);
    const [iderp, setIdErp] = useState(null);
    const [pdfPath, setPdfPath] = useState(null);
    const [pdfError, setPdfError] = useState(null);
    const [searchParams, setSearchParams] = useState({ num_fact: '', datereception: '' });

    useEffect(() => {
        const fetchFournisseurByUserId = async () => {
            try {
                const id = localStorage.getItem('userId');
                const response = await axios.get(`http://localhost:3006/fournisseur/userId/${id}`);
                const iderpFromResponse = response.data.fournisseur.iderp;
                setIdErp(iderpFromResponse);
            } catch (error) {
                console.error('Erreur de récuperation de fournisseur :', error);
            }
        };

        fetchFournisseurByUserId();
    }, []);

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                if (iderp) {
                    const response = await axios.get(`http://localhost:3006/facture/${iderp}`);
                    setFactures(response.data.factures);
                }
            } catch (error) {
                console.error('Erreur de récuperation de factures:', error);
            }
        };

        fetchFactures();
    }, [iderp]);

    const viewFacturePDF = async (pathpdf) => {
        try {
            const response = await axios.get(`http://localhost:3006/facture/view-pdf/${pathpdf}`, {
                responseType: 'blob'
            });
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl);
        } catch (error) {
            console.error('Error viewing facture PDF:', error);
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
            console.error('Erreur recherche facture:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    
    const groupFacturesByYear = () => {
        const groupedFactures = {};
        factures.forEach(facture => {
            const year = new Date(facture.date_fact).getFullYear();
            if (!groupedFactures[year]) {
                groupedFactures[year] = [];
            }
            groupedFactures[year].push(facture);
        });
        return groupedFactures;
    };

    const groupedFactures = groupFacturesByYear();

    return (
        <div>
           
            {Object.keys(groupedFactures).map(year => (
                <div key={year}>
                  
                    <table className="factures-table-historique">
                        <thead>
                            <tr className='historique-row-1'>
                                <th colSpan="3" className='historique' style={{textAlign:'center',color:'white',fontSize:'20px'}}>L'historique des factures de l'année :{year}</th>
                            
                            <td colSpan="3" className="search-row">
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
                            <tr  className='historique-body'>
                                <th>Numéro Facture</th>
                                <th>Montant</th>
                                <th>Numéro PO</th>
                                <th>Date Facture</th>
                                <th>PDF</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedFactures[year].map((facture) => (
                                <tr key={facture.idF} className="facture-row-historique">
                                    <td>{facture.num_fact}</td>
                                    <td>{facture.montant}</td>
                                    <td>{facture.num_po}</td>
                                    <td>{facture.date_fact}</td>
                                    <td>
                                        <button onClick={() => viewFacturePDF(facture.pathpdf)} className="pdf-file"><FaFilePdf /></button>
                                    </td>
                                    <td>
                                        <Link to={`/details/${facture.idF}`}>
                                            <Button className='details-btn'>Details</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {pdfPath && (
                <Document file={pdfPath} error="PDF loading error">
                    <Page pageNumber={1} />
                </Document>
            )}
        </div>
    );
};

export default Historique;
