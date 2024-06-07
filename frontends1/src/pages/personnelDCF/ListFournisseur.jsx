import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaFileAlt } from 'react-icons/fa'; // Import search and file icons
import '../../styles/ListFournisseurs.css'; // Import the CSS file

const ListFournisseur = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchNameTerm, setSearchNameTerm] = useState('');
    const [searchIderpTerm, setSearchIderpTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsIderp, setSearchResultsIderp] = useState([]);
    const userProfile = localStorage.getItem("userProfil");

    useEffect(() => {
        const fetchFournisseurs = async () => {
            try {
                const response = await axios.get("http://localhost:3006/fournisseur/");
                const fournisseursWithStatus = await Promise.all(response.data.map(async fournisseur => {
                    try {
                        const statusResponse = await axios.get(`http://localhost:3006/facture/status/${fournisseur.iderp}`);
                        return { ...fournisseur, status: statusResponse.data };
                    } catch (error) {
                        console.error('Error fetching status for fournisseur:', fournisseur.iderp, error);
                        return fournisseur;
                    }
                }));
                setFournisseurs(fournisseursWithStatus);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching fournisseurs:', error);
                setLoading(false);
            }
        };

        fetchFournisseurs();
    }, []);

    const searchByName = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/user/recherche/parnom?name=${searchNameTerm}`);
            const filteredResults = response.data.filter(user => user.profil === "fournisseur");
            setSearchResults(filteredResults);

            if (filteredResults.length === 0) {
                alert("Aucun fournisseur trouvé avec cet nom.");
            }
        } catch (error) {
            console.error('Error fetching search results by name:', error);
        }
    };

    const searchByIderp = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/fournisseur?iderp=${searchIderpTerm}`);
            const filteredResultsIderp = response.data.filter(fournisseur => fournisseur.iderp.toString() === searchIderpTerm.toString());
            setSearchResultsIderp(filteredResultsIderp);
            setSearchResults([]); 
            if (filteredResultsIderp.length === 0) {
                alert("Aucun fournisseur trouvé avec cet identifiant.");
            }
        } catch (error) {
            console.error('Error fetching search results by iderp:', error);
        }
    };

    const renderSupplierTable = (data) => (
        <div className="table-container">
            <table>
                <thead>
                    
                    <tr className="header-row-2">
                        <th colSpan="4">
                            <div className="search-container">
                                <div style={{ position: 'relative', marginLeft:'50%'}}>
                                    <input
                                        type="text"
                                        value={searchNameTerm}
                                        onChange={(e) => setSearchNameTerm(e.target.value)}
                                        placeholder="Rechercher par nom..."
                                        className="search-input"
                                    />
                                    <FaSearch className="search-icon" color='black' onClick={searchByName} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={searchIderpTerm}
                                        onChange={(e) => setSearchIderpTerm(e.target.value)}
                                        placeholder="Rechercher par identifiant..."
                                        className="search-input"
                                    />
                                    <FaSearch className="search-icon" color='black' onClick={searchByIderp} />
                                </div>
                            </div>
                        </th>
                    </tr>
                    <tr className="header-row-3">
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(fournisseur => (
                        <tr key={fournisseur.iderp} style={{ backgroundColor: fournisseur.status && fournisseur.status.NBFAttente > 0 ? '#ADD8E6' : 'inherit' }}>
                            <td>{fournisseur.User ? fournisseur.User.name : fournisseur.name}</td>
                            <td>{fournisseur.User ? fournisseur.User.email : fournisseur.email}</td>
                            <td>{fournisseur.User ? fournisseur.User.phone : fournisseur.phone}</td>
                            <td>
                                <Link
                                    to={
                                        userProfile === "bof" ? `/listcourriers/${fournisseur.iderp}` :
                                        "/defaultDestination"
                                    }
                                >
                                    <button className="view-invoices-btn"><FaFileAlt /> Voir Factures</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            {searchResults.length > 0 && (
                <div>
                    <h3>Résultats de la recherche par nom</h3>
                    {renderSupplierTable(searchResults)}
                </div>
            )}

            {searchResultsIderp.length > 0 && (
                <div>
                    <h3>Résultats de la recherche par identifiant</h3>
                    {renderSupplierTable(searchResultsIderp)}
                </div>
            )}

            {!searchResults.length > 0 && !searchResultsIderp.length > 0 && (
                <div>
                    {renderSupplierTable(fournisseurs)}
                </div>
            )}
        </div>
    );
};

export default ListFournisseur;
