import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ListFactByB from './ListFactByB';
import { FaSearch, FaFileAlt } from 'react-icons/fa';
import '../../styles/BordereauList.css'; 

const BordereauList = () => {
    const [bordereaux, setBordereaux] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBordereaux();
    }, []);

    const fetchBordereaux = async () => {
        try {
            const response = await axios.get('http://localhost:3006/bordereaux');
            setBordereaux(response.data.bordereaux);
        } catch (error) {
            console.error('Error fetching bordereaux:', error);
        }
    };

    const ViewFactures = (idB) => {
        navigate(`/fact/${idB}`);
    };

    return (
        <div className="bordereau-list-container">
            <table className="bordereau-table">
                <thead>
                    <tr>
                        <th colSpan={3} className="table-header-b">Liste des Bordereaux</th>
                    </tr>
                    <tr className="table-row-header-b">
                        <th>Nature</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bordereaux.map((bordereau) => (
                        <tr key={bordereau.idB} className="table-row-b">
                            <td>{bordereau.nature}</td>
                            <td>{bordereau.date}</td>
                            <td className="action-cell">
                                <button onClick={() => ViewFactures(bordereau.idB)} className="view-factures-btn"><FaFileAlt />Voir Factures</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BordereauList;
