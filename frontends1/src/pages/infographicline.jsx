import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'react-apexcharts';

const InfographicLine = () => {
    const { idF } = useParams();
    const [chartData, setChartData] = useState({
        series: [],
        options: {
            chart: {
                type: 'line',
                height: 100,
                width: 500, 
                zoom: {
                    enabled: false,
                },
            },
            color: '#FF5733', 
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
                width: 10,
            },
            yaxis: {
                min: 0,
                max: 2,
                labels: {
                    show: false,
                },
            },
            tooltip: {
                enabled: false,
            },
            grid: {
                show: false,
            },
            xaxis: {
                categories: [],
                
               
                
            },
        },
    });
    
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEtat = async () => {
            if (!idF) {
                console.error('idF non trouvé');
                setError('idF non trouvé');
                
                return;
            }

            try {
              
                const response = await axios.get(`http://localhost:3006/etat/etatFacture/${idF}`);
                console.log('Response data:', response.data);
                const data = response.data;
                if (Array.isArray(data)) {
                    const filteredData = data.filter(item => {
                        console.log('Item:', item);
                        return (
                            item.etat === 'Attente' ||
                            item.etat === 'Envoye Finanace' ||
                            item.etat === 'Envoye Fiscalité' ||
                            item.etat === 'paiement' ||
                            item.etat === 'cloture'
                        );
                    });
                    
                    const values = filteredData.map(item => item.etat);

                    const completedSteps = [0, 2, 4];
                    const fill = {
                        type: 'gradient',
                        gradient: {
                            shade: 'light',
                            shadeIntensity: 0.4,
                            inverseColors: false,
                            opacityFrom: 0.8,
                            opacityTo: 0.2,
                            stops: []
                        }
                    };

                    const totalSteps = values.length - 1;
                    completedSteps.forEach(stepIndex => {
                        fill.gradient.stops.push(stepIndex / totalSteps);
                    });

                    setChartData({
                        series: [
                            {
                                name: 'Etat',
                                data: values,
                                fill: fill
                            },
                        ],
                        options: {
                            ...chartData.options,
                          
                            xaxis: {
                                categories: values, 
                                labels: {
                                    style: {
                                        colors: ['#3F51B5', '#E91E63', '#9C27B0', '#673AB7', '#F44336'],
                                        fontWeight: 'bold',
                                        fontSize:'14px',
                                    
                 
                                    },
                                },
                            },
                           
                        },
                    });
                } else {
                    console.error('Unexpected data format:', data);
                    setError('Unexpected data format');
                }
                
            } catch (error) {
                console.error('Erreur de recuperation de l etat:', error);
                setError('Erreur de recuperation de l etat');
                
            }
        };

        fetchEtat();
    }, [idF]);

   

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div >
            <h2 style={{textAlign:'center',fontSize:'25px',marginTop:'20px',background:'#fae6c3',padding:'20px'}}>Etat for Facture ID: {idF}</h2>
           
            <Chart
                options={chartData.options}
                series={chartData.series}
                type="line"
                height={300}
               
                
               
               
            />
           
           
        </div>
    );
};

export default InfographicLine;
