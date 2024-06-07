import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useRoute,useNavigation } from '@react-navigation/native';




// Function to fetch fournisseur by userId
const fetchFournisseurByUserId = async (userId, setIdeRp) => {
  try {
    const response = await axios.get(`http://192.168.0.5:3006/fournisseur/userId/${userId}`);
    const iderpFromResponse = response.data.fournisseur.iderp;
    setIdeRp(iderpFromResponse);
  } catch (error) {
    console.error('Error fetching fournisseur:', error);
  }
};

// Function to fetch factures
const fetchFactures = async (iderp, setFactures) => {
  try {
    if (iderp) {
      const response = await axios.get(`http://192.168.1.123:3006/facture/${iderp}`);
      setFactures(response.data.factures);
    }
  } catch (error) {
    console.error('Error fetching factures:', error);
  }
};

// Function to delete a facture
export const deleteFacture = async (iderp, idF) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Token not found in AsyncStorage');
    }

    const response = await axios.delete(`http://192.168.1.123:3006/facture/fournisseur/${iderp}/facture/${idF}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log(response.data.message);
      Alert.alert('Success', 'Facture deleted successfully.');
    }
  } catch (error) {
    console.error('Error deleting facture:', error);
    Alert.alert('Error', 'An error occurred while deleting facture.');
  }
};

// Usage in your component
const YourComponent = ({ userId }) => {
    const [iderp, setIdeRp] = useState(null);
    const [factures, setFactures] = useState([]);
  
    useEffect(() => {
      fetchFournisseurByUserId(userId, setIdeRp);
    }, [userId]);
  
    useEffect(() => {
      fetchFactures(iderp, setFactures);
    }, [iderp]);
  
    const handleDeleteFacture = async (idF) => {
      // Make sure iderp and idF are set or updated correctly before calling deleteFacture
      if (iderp && idF) {
        await deleteFacture(iderp, idF);
        // Optionally, update the factures list after deleting the facture
        fetchFactures(iderp, setFactures);
      } else {
        console.error('iderp or idF is missing.');
      }
    };
  
    return (
      // Your component JSX here
      <Button title="Delete Facture" onPress={() => handleDeleteFacture(idFToDelete)} />
    );
  
 
};
