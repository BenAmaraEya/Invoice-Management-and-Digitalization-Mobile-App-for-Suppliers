import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "../styles/ListUser.css";
import '@fortawesome/fontawesome-free/css/all.css';

function ListUser() {
    const [fournisseur, setFournisseur] = useState([]);
    const [searchNameTerm, setSearchNameTerm] = useState('');
    const [searchIderpTerm, setSearchIderpTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsIderp, setSearchResultsIderp] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFournisseur = async () => {
            try {
                const response = await axios.get('http://localhost:3006/fournisseur/');
                setFournisseur(response.data);
            } catch (error) {
                setError(error);
                console.error('Error fetching fournisseurs:', error);
            }
        };
    
        fetchFournisseur();
    }, []);

    const DeleteFournisseur = async (iderp) => {
        try {
            await axios.delete(`http://localhost:3006/fournisseur/${iderp}`);
            setFournisseur(prevFournisseurs => prevFournisseurs.filter(fournisseur => fournisseur.iderp !== iderp));
            console.log('Fournisseur supprimé avec succès');
            alert(`Fournisseur ${fournisseur.iderp} supprimé avec succès.`);

        } catch (error) {
            console.error('Erreur lors de la suppression du fournisseur:', error);
        }
    };

    const Acesse = async (id) => {
        try {
            await axios.post(`http://localhost:3006/user/acces/${id}`);
            console.log('Envoyer accées au système avec succès');
            alert('Envoyer accées au système avec succès');
        } catch (error) {
            console.error('Erreur :', error);
        }
    };

    const searchByName = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/user/recherche/parnom?name=${searchNameTerm}`);
            const filteredResults = response.data.filter(user => user.profil == "fournisseur");
            setSearchResults(filteredResults);
            console.log(filteredResults);
            if (filteredResults.length === 0) {
                alert("Aucun fournisseur trouvé avec ce nom.");
            }
        } catch (error) {
            setError(error);
            console.error('Erreur de recuperation de resultat:', error);
        }
    };

    const searchByIderp = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/fournisseur/recherche/ParIdentifiant?iderp=${searchIderpTerm}`);
            if (response.data.length > 0) {
                const userData = response.data[0].User; // Accéder aux données de l'utilisateur du premier fournisseur trouvé
                setSearchResultsIderp(userData);
                console.log(userData); // Assurez-vous que les données de l'utilisateur sont correctement renvoyées ici
            } else {
                alert("Aucun fournisseur trouvé avec cet iderp.");
            }
            console.log(response.data);
        } catch (error) {
            setError(error);
            console.error('Erreur de recuperation de resultat:', error);
        }
    };
    

    const filteredList = searchResults.length > 0 ? searchResults : fournisseur;

    const renderSupplierTable = (data) => (
        <table>
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Active</th>
                    <th>Dernière Connexion</th>
                    <th>Téléphone</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {data.map((fournisseur, i) => (
                    <tr key={i}>
                        <td>{fournisseur.User ? fournisseur.User.name : fournisseur.name}</td>
                        <td>{fournisseur.User ? fournisseur.User.username : fournisseur.username}</td>
                        <td>{fournisseur.User ? fournisseur.User.email : fournisseur.email}</td>
                        <td>
                            {fournisseur.User ? (
                                fournisseur.User.isActive ? (
                                    <div>
                                        <i className="fas fa-check-circle"></i> Connecté
                                    </div>
                                ) : (
                                    <div>
                                        <i className="fas fa-times-circle"></i> Déconnecté
                                    </div>
                                )
                            ) : (
                                fournisseur.isActive ? (
                                    <div>
                                        <i className="fas fa-check-circle"></i> Connecté
                                    </div>
                                ) : (
                                    <div>
                                        <i className="fas fa-times-circle"></i> Déconnecté
                                    </div>
                                )
                            )}
                        </td>
                        <td>{fournisseur.User ? fournisseur.User.last_login : fournisseur.last_login}</td>
                        <td>{fournisseur.User ? fournisseur.User.phone : fournisseur.phone}</td>
                        <td>
                            <button>
                                <Link className="update-link" to={`../updateFournisseur/${data.iderp}`}>Modifier</Link>
                            </button>
                            <button onClick={() => DeleteFournisseur(data.iderp)} className="delete-button">Supprimer</button>
                            <button className="access-button" onClick={() => Acesse(data.id)}>Accès</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <input
                type="text"
                value={searchNameTerm}
                onChange={(e) => setSearchNameTerm(e.target.value)}
                placeholder="Rechercher par nom..."
            />
            <button onClick={searchByName}>Rechercher</button>
            <input
                type="number"
                value={searchIderpTerm}
                onChange={(e) => setSearchIderpTerm(e.target.value)}
                placeholder="Rechercher par iderp..."
            />
            <button onClick={searchByIderp}>Rechercher par identifiant</button>
           
            {searchResultsIderp && Object.keys(searchResultsIderp).length > 0 && (
    <div>
        <h3>Résultats de la recherche par iderp</h3>
        {renderSupplierTable([searchResultsIderp])} 
    </div>
)}
            {searchResults.length > 0 && (
                <div>
                    <h3>Résultats de la recherche par nom</h3>
                    {renderSupplierTable(searchResults)}
                </div>
            )}

            {!searchResults.length > 0 && fournisseur.length > 0 && (
                <div>
                    <Link to="/addUser" className="add-user-link">Ajouter Fournisseur</Link>   
                    <h3 className="list-fournisseur">Liste Fournisseurs</h3>    
                    {renderSupplierTable(fournisseur)}
                </div>
            )}
               {searchResults.length == 0 && !fournisseur.length > 0  &&(
                <div>
                    <h3 className="list-fournisseur">Liste vide</h3>    
                </div>
            )}
        </div>
    );
}

export default ListUser;
