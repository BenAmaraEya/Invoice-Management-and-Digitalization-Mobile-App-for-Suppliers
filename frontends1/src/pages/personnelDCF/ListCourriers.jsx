import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

import { Link, useParams } from 'react-router-dom';
import { Button } from 'reactstrap';
import '../../styles/listecourriers.css';
import { FaTrashAlt, FaPen, FaSearch, FaFilePdf,FaEye,FaEdit} from 'react-icons/fa';
import { BsTrash } from 'react-icons/bs';
import InfographicLine from '../infographicline';
//pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ListCourriers = () => {
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
    const [searchParams, setSearchParams] = useState({ num_fact: '', datereception: '' }); // Define searchParams state
    const [etat, setEtat] = useState({});

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const response = await axios.get(`http://localhost:3006/facture/${iderp}`);
                setFactures(response.data.factures);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching factures:', error);
                setLoading(false);
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

    const validerDocument = async (idF) => {
        try {
            const token=localStorage.getItem("accessToken");
            await axios.put(`http://localhost:3006/facture/validerCourriers/${idF}`,null,
            {headers: {
                Authorization: `Bearer ${token}`
            }});
           alert("Validation réussie pour la facture.");
           window.location.reload();
        } catch (error) {
            console.error('Error valide document: ', error);
        }
    };

    const rejeteDocument = async (idF, motifRejete) => {
        try {
            const token=localStorage.getItem("accessToken");
            await axios.put(`http://localhost:3006/facture/rejeteCourrier/${idF}`, { motifRejete },
            {headers: {
                Authorization: `Bearer ${token}`
            }});
            setMotifsRejete(prevState => ({ ...prevState, [idF]: motifRejete }));
            alert("La facture a été rejetée.");

            window.location.reload();
        } catch (error) {
            console.error('Error rejete document: ', error);
        }
    };
    const deleteFacture = async (idF) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.delete(`http://localhost:3006/facture/fournisseur/${iderp}/facture/${idF}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFactures(factures.filter(facture => facture.idF !== idF));
                console.log(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting facture:', error);
        }
    };
    const rechercheFacture = async () => {
        try {
            const response = await axios.get('http://localhost:3006/facture/recherche/ParDATEetNUM', {
                params: searchParams
            });
            // Handle the response data here, update state accordingly
            if (response.data) {
                // Update the factures state with the filtered facture data
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

    const renderFactureTable = (factures) => (
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
                    <th>Action</th>
                    <th>valider</th>
                    <th>rejeter</th>
                    <th>Etat</th>
                    <th>PDF</th>
                    <th>localisation</th>
                </tr>
            </thead>
            <tbody>
                {factures.map((facture) => (
                    <tr key={facture.idF}>
                        <td>{facture.idF}</td>
                        <td>{facture.num_fact}</td>
                        <td>{facture.factname}</td>
                        <td>{facture.montant}</td>
                        <td>{facture.status}</td>
                        <td>{facture.num_po}</td>
                        <td>{facture.date_fact}</td>
                        <td>
                                <button onClick={() => deleteFacture(facture.idF)} style={{background:'none' ,border:'none'}}>
                                <FaTrashAlt  className='delete-btn' style={{fontSize: '18px', backgroundColor: 'transparent',color:'black',border:'none'}} />
                                </button>
                                <Link to={`/updatefacture/${facture.idF}`}>
                                <FaEdit className='edit' color="black" style={{fontSize:'18px'}} />
                                </Link>
                                </td>
                                <td>
                                <button className='btn-validcourriers' onClick={() => validerDocument(facture.idF)}>valider</button>
                                </td>
                                <td>
                                <select 
                                name="status" 
                                value={motifsRejete[facture.idF] || ''} 
                                onChange={(e) => rejeteDocument(facture.idF, e.target.value)}>
                                <option value="">Choisir motif de rejet</option>
                                <option value="Manque PV">Manque PV</option>
                                <option value="Manque BL">Manque BL</option>
                                <option value="Manque fiche de présences">Manque fiche de présences</option>
                                <option value="Manque copie du PO">Manque copie du PO</option>
                            </select>
                                </td>
                             <td>
                             <select 
                                name="etat" 
                                value={etat[facture.idF] || ''} 
                                onChange={(e) => updateProcessus(facture.idF, e.target.value)}>
                                <option value="">choisir etat facture</option>
                                <option value="Envoye Finanace">Envoye Finanace</option>
                                <option value="Envoye Fiscalité">Envoyé Fiscalité</option>
                                <option value="paiement">paiement</option>
                                <option value="cloture">cloturé</option>
                            </select> </td>  
                            
                           
                        <td>
                            <button onClick={() => viewFacturePDF(facture.pathpdf)} className='pdf-file'> <FaFilePdf /></button>
                        </td>
                        <td>
              <Link to={`/infographic/${facture.idF}`}>
              <FaEye color="black" className='view-etat' style={{fontSize: '20px',marginLeft:'30px'}}/>
              </Link>
            </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
const updateProcessus= async (idF, etat) => {
    try {
        //const token=localStorage.getItem("accessToken");
        await axios.post(`http://localhost:3006/etat/add/${idF}`, { etat },
       /* {headers: {
            Authorization: `Bearer ${token}`
        }}*/);
        setEtat(prevState => ({ ...prevState, [idF]: etat }));
        alert(`L'état de la facture a été changé en ${etat}.`);

        window.location.reload();
    } catch (error) {
        console.error('Error : ', error);
    }
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

export default ListCourriers;
