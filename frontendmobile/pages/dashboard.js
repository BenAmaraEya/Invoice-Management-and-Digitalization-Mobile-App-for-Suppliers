import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Footer from '../components/Footer';
//import { getIpAddressAsync } from 'expo-network';

const Dashboard = () => {
  const [iderp, setIderp] = useState(null);
  const [factureCounts, setFactureCounts] = useState({
    NBFValide: 0,
    NBFpaye: 0,
    NBFAttente: 0,
    NBFrejete: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [localIp, setLocalIp] = useState(null);

  const route = useRoute();
  const { userId } = route.params;
  const AdresseIp='192.168.0.5'
  /*useEffect(() => {
    const fetchLocalIpAddress = async () => {
      try {
        const ipAddress = await getIpAddressAsync(); // Get local IP address
        setLocalIp(ipAddress);
      } catch (error) {
        console.error('Error fetching local IP address:', error);
      }
    };

    fetchLocalIpAddress();
  }, []);*/

  useEffect(() => {
    const fetchFournisseurById = async () => {
      try {
        const response = await axios.get(`http://${AdresseIp}:3006/fournisseur/userId/${userId}`);
        const iderpFromResponse = response.data.fournisseur.iderp;
        setIderp(iderpFromResponse);
      } catch (error) {
        console.error('Erreur de récuperation de fournisseur:', error);
      }
    };

    fetchFournisseurById();
  }, [userId]);

  useEffect(() => {
    const fetchFactureCounts = async () => {
      try {
        if (iderp) {
          const response = await axios.get(`http://${AdresseIp}:3006/facture/status/${iderp}`);
          const { NBFValide, NBFpaye, NBFAttente, NBFrejete } = response.data;
          setFactureCounts({ NBFValide, NBFpaye, NBFAttente, NBFrejete });
          setChartData([
            {
              name: 'Validé',
              population: NBFValide,
              color: '#fae6c3',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
            {
              name: 'Payé',
              population: NBFpaye,
              color: '#bad381',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
            {
              name: 'Attente',
              population: NBFAttente,
              color: '#4367c4',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
            {
              name: 'Rejeté',
              population: NBFrejete,
              color: '#d1c2d9',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
          ]);
        }
      } catch (error) {
        console.error('Error de récuperation de statistique de facture:', error);
      }
    };

    fetchFactureCounts();
  }, [iderp]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.title}>Tableau de bord</Text>
          <PieChart
            data={chartData}
            width={380}
            height={220}
            chartConfig={{
              backgroundColor: '#f5f5f5',
              backgroundGradientFrom: '#f5f5f5',
              backgroundGradientTo: '#f5f5f5',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="22"
            absolute
          />
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <Footer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#eff0f6',
    borderRadius: 25,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 20,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default Dashboard;
