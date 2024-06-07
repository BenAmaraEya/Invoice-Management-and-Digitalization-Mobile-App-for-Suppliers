import React, { useState } from "react";
import axios from 'axios';
import "../styles/AddUser.css";
import { useNavigate } from "react-router-dom";

function AddUser() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        profil: "",
        phone: ""
    });
    const [formFournisseur, setFormFournisseur] = useState({
        iderp: "",
        idfiscale: "",
        adresse: "",
        nationnalite: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFournisseurChange = (e) => {
        const { name, value } = e.target;
        setFormFournisseur(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const Submit = async (e) => {
        e.preventDefault();

        try {
            // Ajouter l'utilisateur d'abord
            const userResponse = await axios.post('http://localhost:3006/user/adduser', formData);
            const userId = userResponse.data.user.id; 
            console.log(userResponse.data.user.id)
            if(userResponse.data.user.profil === "fournisseur"){
            // Ajouter Fournisseur
            const fournisseurData = { ...formFournisseur, userId: userId };
            const fournisseurResponse = await axios.post('http://localhost:3006/fournisseur/addfournisseur', fournisseurData);
            console.log('Fournisseur ajouté avec succès:', fournisseurResponse.data);
        }
        
            navigate('/listUser');
            

        } catch (error) {
            console.error('Erreur lors de l\'ajout du fournisseur:', error);
        }
    };

    return (
        <form onSubmit={Submit} className="add-user-form">
            <h2>Ajouter Utilisateur</h2>
            <div>
                <label htmlFor="name">Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Saisir Nom" className='form-control' />
                <label htmlFor="username">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Saisir Username" className='form-control' />
                <label htmlFor="email">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Saisir Email" className='form-control' />
                <label htmlFor="profil">Profil</label>
                <select name="profil" value={formData.profil} onChange={handleChange} className='form-control'>
                    <option value="">Choisir un profil</option>
                    <option value="fournisseur">Fournisseur</option>
                    <option value="bof">BOF</option>
                    <option value="agentTresorerie">Agent Trésorerie </option>
                    <option value="personnelfiscalite">Personnel fiscalité  </option>
                </select>
                <label htmlFor="phone">Numéro Téléphone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Saisir numéro téléphone" className='form-control' />
                {formData.profil === "fournisseur" && (
                    <div>
                        <h3>Formulaire Fournisseur</h3>
                        <label htmlFor="iderp">iderp</label>
                        <input type="number" name="iderp" value={formFournisseur.iderp} onChange={handleFournisseurChange} className='form-control' />
                        <label htmlFor="idfiscale">idFiscale</label>
                        <input type="number" name="idfiscale" value={formFournisseur.idfiscale} onChange={handleFournisseurChange} className='form-control' />
                        <label htmlFor="adresse">Adresse</label>
                        <input type="text" name="adresse" value={formFournisseur.adresse} onChange={handleFournisseurChange} className='form-control' />
                        <label htmlFor="nationnalite">Nationalité</label>
                        <input type="text" name="nationnalite" value={formFournisseur.nationnalite} onChange={handleFournisseurChange} className='form-control' />
                    </div>
                )}
                <button type="submit">Ajouter</button>
            </div>
        </form>
    );
}

export default AddUser;
