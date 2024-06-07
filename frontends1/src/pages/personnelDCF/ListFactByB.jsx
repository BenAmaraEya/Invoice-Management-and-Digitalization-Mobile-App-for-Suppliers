import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const ListFactByB = ({  }) => {
    const { idB } = useParams();
    const [factures, setFactures] = useState([]);

    useEffect(() => {
        if (idB) {
            fetchFactures(idB);
        }
    }, [idB]);

    const fetchFactures = async (idB) => {
        try {
            const response = await axios.get(`http://localhost:3006/bordereaux/${idB}/factures`);
            setFactures(response.data.factures);
        } catch (error) {
            console.error('Error fetching factures:', error);
        }
    };
    return (
        <div>
            <h2>Liste des Factures pour le Bordereau {idB}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Facture ID</th>
                        <th>Numéro Facture</th>
                        <th>Facture Name</th>
                        <th>Montant</th>
                        <th>Status</th>
                        <th>Numéro PO</th>
                        <th>Date Facture</th>
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListFactByB;
