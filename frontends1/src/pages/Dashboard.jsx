import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './../styles/dashboard.css';

const Dashboard = () => {
  const [iderp, setIdErp] = useState(null);

  const [factureCounts, setFactureCounts] = useState({
    NBFValide: 0,
    NBFpaye: 0,
    NBFAttente: 0,
    NBFrejete: 0,
  });

  useEffect(() => {
    const fetchFournisseurById = async () => {
      try {
        const id = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:3006/fournisseur/userId/${id}`);
        const iderpFromResponse = response.data.fournisseur.iderp;
        setIdErp(iderpFromResponse);
      } catch (error) {
        console.error('Erreur de récuperation de fournisseur:', error);
      }
    };

    fetchFournisseurById();
  }, []);

  useEffect(() => {
    const fetchFactureCounts = async () => {
      try {
        if (iderp) {
          const response = await axios.get(`http://localhost:3006/facture/status/${iderp}`);
          const { NBFValide, NBFpaye, NBFAttente, NBFrejete } = response.data;
          setFactureCounts({ NBFValide, NBFpaye, NBFAttente, NBFrejete });
        }
      } catch (error) {
        console.error('Erreur de :', error);
      }
    };

    fetchFactureCounts();
  }, [iderp]);

  const options = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Validé', 'Payé', 'En Attente', 'Rejeté'],
    },
  };

  const series = [
    {
      name: 'Nombre de Factures',
      data: [factureCounts.NBFValide, factureCounts.NBFpaye, factureCounts.NBFAttente, factureCounts.NBFrejete],
    },
  ];

  

 

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      <div className="chart-container">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
     
      
    </div>
  );
};

export default Dashboard;
