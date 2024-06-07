import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaTrash,FaSearch,FaFilePdf } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'reactstrap';
import '../../styles/listecourriers.css';

pdfjs.GlobalWorkerOptions.workerSrc = `cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ListeFacturesFiscalité = () => {
    const [pdfPath, setPdfPath] = useState(null);
    const [motifRejete, setMotifRejete] = useState(''); 
    const [motifsRejete, setMotifsRejete] = useState({});
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const { iderp } = useParams(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchDateTerm, setSearchDateTerm] = useState('');
    const [searchResultsDate, setSearchResultsDate] = useState([]);
    const [searchParams, setSearchParams] = useState({ num_fact: '', datereception: '' });

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const response = await axios.get(`http://localhost:3006/facture`);
                if (response.data && response.data.factures) {
                    setFactures(response.data.factures);
                } else {
                    console.error('Invalid response from server:', response);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching factures:', error);
                setLoading(false);
            }
        };

        fetchFactures();
    }, []);

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

    const validerFiscalité = async (idF) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put(`http://localhost:3006/facture/validerfiscalite/${idF}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Validation réussie pour la facture.');
            window.location.reload();
           // window.location.href = window.location.href;
        } catch (error) {
            console.error('Error valide document: ', error);
        }
    };

    const rejeteDocument = async (idF, motifRejete) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put(`http://localhost:3006/facture/rejeteCourrier/${idF}`, { motifRejete }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMotifsRejete(prevState => ({ ...prevState, [idF]: motifRejete }));
            alert('La facture a été rejetée.');

            window.location.reload();
        } catch (error) {
            console.error('Error rejete document: ', error);
        }
    };

    const rechercheFacture = async () => {
        try {
            console.log("Search Parameters:", searchParams); 
            const response = await axios.get('http://localhost:3006/facture/recherche/ParDATEetNUM', {
                params: {
                    ...searchParams,
                    status: ['courrier validé par BOF', 'courrier validé par Personnel fiscalité', 'Id Fiscale Invalide', 'Manque']
                }
            });
            console.log("Server Response:", response);
            if (response.data) {
                setFactures([response.data]);
            } else {
                console.error('Invalid response from server:', response);
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

    const renderFactureTable = (factures) => {
        const facturesArray = Array.isArray(factures) ? factures : [];

        return (
            <table className='courriers-table'>
                <thead>
                <tr className='courriers-1' >
<td colSpan='13' className="courriers-row-1" >
     <div className="search-row-container" >
                <input type="text" name="num_fact"
                 placeholder="Numéro Facture" 
                 value={searchParams.num_fact} 
                 onChange={handleInputChange}  
                 className="search-input-courriers"/>
                <input type="date"
                 name="datereception"
                  placeholder="Date de Réception (yyyy-mm-dd)"
                   value={searchParams.datereception} 
                   onChange={handleInputChange}  
                   className="search-input-courriers"/>
                 <button onClick={rechercheFacture} className="search-btn-courriers" ><FaSearch /></button>
            </div>
           </td>
           </tr>
           <tr className="courriers-row-2">
                        <th>Facture ID</th>
                        <th>Numéro Facture</th>
                        <th>Facture Name</th>
                        <th>Montant</th>
                        <th>Status</th>
                        <th>Numéro PO</th>
                        <th>Date Facture</th>
                        <th>PDF</th>
                        <th>valider</th>
                        <th>Rejete</th>
                    </tr>
                </thead>
                <tbody>
                   
                    {facturesArray
                        .filter(facture => facture.status.includes('courrier validé par BOF') || facture.status.includes('courrier validé par Personnel fiscalité') || facture.status.includes('Id Fiscale Invalide') || facture.status.includes('Manque'))
                        .map((facture) => (
                            <tr key={facture.idF}>
                               <td>{facture.idF}</td>
                <td>{facture.num_fact}</td>
                <td>{facture.factname}</td>
                <td>{facture.montant}</td>
                <td>{facture.status}</td>
                <td>{facture.num_po}</td>
                <td>{facture.date_fact}</td>
                <td>
                    <button onClick={() => viewFacturePDF(facture.pathpdf)} className='pdf-file'><FaFilePdf /></button>
                </td>
                <td>
                    <button className='btn-validcourriers' onClick={() => validerFiscalité(facture.idF)}>valider</button>
                </td>
                <td>
                    <select 
                        name="status" 
                        value={motifsRejete[facture.idF] || ''} 
                        onChange={(e) => rejeteDocument(facture.idF, e.target.value)}>
                        <option value="">Choisir motif de rejet</option>
                        <option value="Id Fiscale Invalide">Id Fiscale Invalide </option>
                        <option value="Manque BL">Manque BL</option>
                        <option value="Manque fiche de présences">Manque fiche de présences</option>
                        <option value="Manque copie du PO">Manque copie du PO</option>
                    </select>
                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        );
    };

    return (
        <div>
           
            {searchResults.length > 0 && (
                <div>
                    <h3>Résultats de la recherche</h3>
                    {renderFactureTable(searchResults)}
                </div>
            )}
            {searchResultsDate.length > 0 && (
                <div>
                    <h3>Résultats de la recherche</h3>
                    {renderFactureTable(searchResultsDate)}
                </div>
            )}
            {!searchResults.length > 0 && !searchResultsDate.length > 0 && (
                <div>
                    {renderFactureTable(factures)}
                    {pdfPath && (
                        <Document file={pdfPath} error="PDF loading error">
                            <Page pageNumber={1} />
                        </Document>
                    )}
                </div>
            )}
        </div>
    );
};

export default ListeFacturesFiscalité;
