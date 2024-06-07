
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Update.css";

function UpdateUser() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        phone: ""
    });
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3006/user/${id}`);
                const userData = response.data;
    
                // Créer un nouvel objet formData en fusionnant les données du fournisseur et de l'utilisateur
                const updatedFormData = {
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
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const updateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3006/user/update/${id}`, formData);
            console.log('Utilisateur modifié avec succès');
            navigate('/listUser');
                } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        }
    };

    return (
        <form onSubmit={updateUser} className="form-container">
            <h2>Modifier Personnel DFC</h2>
            <div>
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

export default UpdateUser;
