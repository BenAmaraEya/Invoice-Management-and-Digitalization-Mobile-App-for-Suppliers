
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Update.css";

function UpdateFournisseur() {
    const [formData, setFormData] = useState({
        iderp: "",
        idfiscale: "",
        adresse: "",
        nationnalite: "",
        userId: "",
        name: "",
        username: "",
        email: "",
        phone: ""
    });
    const { iderp } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3006/fournisseur/${iderp}`);
                const fournisseurData = response.data.fournisseur;
                const userData = fournisseurData.User;
    
                // Créer un nouvel objet formData en fusionnant les données du fournisseur et de l'utilisateur
                const updatedFormData = {
                    iderp: fournisseurData.iderp,
                    idfiscale: fournisseurData.idfiscale,
                    adresse: fournisseurData.adresse,
                    nationnalite: fournisseurData.nationnalite,
                    userId: userData.id,
                    name: userData.name,
                    username: userData.username,
                    email: userData.email,
                    
                    phone: userData.phone
                };
    
                setFormData(updatedFormData);
            } catch (error) {
                console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
            }
        };
    
        fetchUserData();
    }, [iderp]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const UpdateFournisseur = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3006/fournisseur/${iderp}`, formData);
            console.log('Utilisateur modifié avec succès');
            navigate('/listSupplier');
                } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        }
    };

    return (
        <form onSubmit={UpdateFournisseur} className="form-container">
            <h2>Modifier Fournisseur</h2>
            <div>
                <label htmlFor="iderp">iderp</label>
                <input type="number" name="iderp" value={formData.iderp} onChange={handleChange} />
                <label htmlFor="idFiscale">idFiscale</label>
                <input type="number" name="idFiscale" value={formData.idfiscale} onChange={handleChange} />
                <label htmlFor="adresse">Adresse</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
                <label htmlFor="nationnalite">Nationnalite</label>
                <input type="text" name="nationnalite" value={formData.nationnalite} onChange={handleChange} />
                <label htmlFor="name">Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                <label htmlFor="username">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} />
                <label htmlFor="email">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                
                <label htmlFor="phone">Numéro Télephone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                <button type="submit">Modifier</button>
            </div>
        </form>
    );
}

export default UpdateFournisseur;
