import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const ReclamationDetails = () => {
 
  const { id } = useParams();

  
  const [reclamation, setReclamation] = useState(null);
  const [fournisseur, setFournisseur] = useState([]);
  

  
  useEffect(() => {
    const fetchReclamation = async () => {
      try {
        
        const response = await axios.get(`http://localhost:3006/reclamation/${id}`, { lue: true });
        setReclamation(response.data);

        const fournisseurResponse = await axios.get('http://localhost:3006/fournisseur/');
        setFournisseur(fournisseurResponse.data);
      } catch (error) {
        console.error('Error fetching reclamation details:', error);
      }
    };

    
    fetchReclamation();
  }, [id]);
 

const sendEmailAndDeleteReclamation = async (email, reclamationId) => {
  try {
      const subject = encodeURIComponent('Réponse de réclamation');
      window.location.href = `mailto:${email}?subject=${subject}`;
      
      const confirmationResult = window.confirm('Confirmez-vous que vous avez envoyé le mail?');
  
      if (confirmationResult) {
          deleteReclamation(reclamationId);
      } else {
          console.log('Operation canceled');
      }
      
     
  } catch (error) {
      console.error('Error sending email and deleting reclamation:', error);
  }
};

const deleteReclamation = async (reclamationId) => {
  try {
      await axios.delete(`http://localhost:3006/reclamation/${reclamationId}`);
      setReclamation(reclamation.filter(reclamation => reclamation.id !== reclamationId));
  } catch (error) {
      console.error('Error deleting reclamation:', error);
  }
};
  
  return (
    <div>
      <h2>Reclamation Details</h2>
      {reclamation ? (
        <table>
          <thead>
            <tr>
              <th>Contenu de la Réclamation</th>
              <th>ID Fournisseur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{reclamation.contenu}</td>
              <td>{reclamation.iderp}</td>
              <td>
                {fournisseur.map((fournisseurItem) => {
                  if (fournisseurItem.iderp === reclamation.iderp && fournisseurItem.User) {
                    return (
                      <button key={fournisseurItem.id} onClick={() => sendEmailAndDeleteReclamation(fournisseurItem.User.email, reclamation.id)}>Répondre</button>
                    );
                  }
                  return null;
                })}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

// Export ReclamationDetails component
export default ReclamationDetails;
