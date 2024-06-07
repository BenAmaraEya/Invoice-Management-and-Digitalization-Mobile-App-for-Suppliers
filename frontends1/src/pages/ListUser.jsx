import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "../styles/ListUser.css";
import '@fortawesome/fontawesome-free/css/all.css';
function ListUser() {
    const [user, setUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [error, setError] = useState(null);

   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3006/user/');
                setUser(response.data);
            } catch (error) {
                setError(error);
                console.error('Error fetching utilisateur:', error);
            }
        };
    
        fetchData();
    }, []);
  
     //Supprimer personnel
     const DeleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:3006/user/delete/${id}`);
            setUser(prevUsers => prevUsers.filter(user => user.id !== id));
            console.log('utilisateur supprimé avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression du utilisateur:', error);
        }
    };
    // donner accées au système
    const Acesse = async (id) => {
        try {
            await axios.post(`http://localhost:3006/user/acces/${id}`);
            console.log('Envoyer accées au système avec succès');
        } catch (error) {
            console.error('Erreur :', error);
        }
    };
    const SearchName = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/user/recherche/parnom?name=${searchTerm}`);
            const filteredResults = response.data.filter(user => user.profil !== "fournisseur");
            setSearchResults(filteredResults);
            if(filteredResults ==''){
                alert("Aucun personnel trouvé avec ce nom.");
            }
            console.log(filteredResults);
        } catch (error) {
            setError(error);
            console.error('Erreur de recuperation de resultat:', error);
        }
    };
    const filteredList = searchResults.length > 0 ? searchResults : user;
   const renderUserTable = (user) => (
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
                        {user.map((data, i) => (
    data.profil === "bof" && (
        <tr key={i}>
            <td>{data.name}</td>
            <td>{data.username}</td>
            <td>{data.email}</td>
            <td>
                {data.isActive ? (
                    <div>
                        <i className="fas fa-check-circle"></i> Connecté
                    </div>
                ) : (
                    <div>
                        <i className="fas fa-times-circle"></i> Déconnecté
                    </div>
                )}
            </td>
            <td>{data.last_login}</td>
            <td>{data.phone}</td>
            <td>
            <button onClick={() => DeleteUser(data.id)} className="delete-button">Supprimer</button>
            <button onClick={() => Acesse(data.id)} className="access">Access</button>
            <button>
                 <Link className="update-link"to={`../updateUser/${data.id}`} >Modifier</Link>
             </button>
            </td>
        </tr>
    )
))}
                        </tbody>
                    </table>
   );
    return (
        <div>
           <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom..."
            />
            <button onClick={SearchName}>Rechercher</button>
            {/* Rendu des résultats de recherche */}
            {searchResults.length > 0 && (
                <div>
                    <h3>Résultats de la recherche</h3>
                    {renderUserTable(searchResults)}
                </div>
            )}
              {!searchResults.length > 0 && (
                <div>
<Link to="/addUser" className="add-user-link">Ajouter Utilisateur</Link>   
             
            <h3 className="list-fournisseur">Liste BOF</h3>    
            {renderUserTable(user)}
            </div>
            )}
        </div>
    );
}

export default ListUser;
