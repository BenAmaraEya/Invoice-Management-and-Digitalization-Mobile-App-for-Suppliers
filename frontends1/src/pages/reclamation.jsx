import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Reclamation.css'; // Import your CSS file for styling

const ReclamationForm = () => {
    const [contenu, setContenu] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [iderp, setIdErp] = useState('');

    useEffect(() => {
        const fetchFournisseurByUserId = async () => {
            try {
                const id = localStorage.getItem('userId');
                const response = await axios.get(`http://localhost:3006/fournisseur/userId/${id}`);
                const iderp = response.data.fournisseur.iderp;
                setIdErp(iderp);
            } catch (error) {
                console.error('Error fetching fournisseur:', error);
            }
        };

        fetchFournisseurByUserId();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (iderp) {
                const response = await axios.post(`http://localhost:3006/reclamation/envoyer/${iderp}`, { contenu });
                console.log(response.data); 
                setContenu('');
                setErrorMessage('');
            }
           
        } catch (error) {
            console.error('Error sending reclamation:', error);
            setErrorMessage('Erreur lors de l\'envoi de la réclamation');
        }
    };

    return (
        <div className="reclamation-form-container">
            <h2>Envoyer une réclamation</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="contenu">Contenu de la réclamation:</label>
                    <textarea id="contenu" value={contenu} onChange={(e) => setContenu(e.target.value)} required />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="submit-button">Envoyer</button>
            </form>
        </div>
    );
};

export default ReclamationForm;
