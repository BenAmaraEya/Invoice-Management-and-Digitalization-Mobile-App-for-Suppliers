import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import Footer from '../components/Footer';

/*const RadioButton = ({ selected, onSelect }) => (
  <TouchableOpacity onPress={onSelect} style={styles.radio}>
    {selected ? <View style={styles.radioDot} /> : null}
  </TouchableOpacity>
);*/

const UpdateFacture = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { idF } = route.params;

  const piecesJointesOptions = [
    { piece_name: 'PV DE RÉCEPTION' },
    { piece_name: 'BON DE COMMANDE' },
    { piece_name: 'BON DE LIVRAISON' },
    { piece_name: 'COPIE DE CONTRAT' },
    { piece_name: 'APPEL À LA FACTURATION' },
    { piece_name: 'RELEVÉ CONSOMMATION' },
    { piece_name: 'CIN' },
  ];

  const [formData, setFormData] = useState({
    num_fact: '',
    num_po: '',
    date_fact: new Date(),
    montant: '',
    factname: '',
    devise: 'TND',
    nature: '',
    objet: '',
    datereception: '',
    pathpdf: '',
    idfiscale: '',
    fournisseur: '',
    delai_paiement: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    piece_name: [],
  });

  const [selectedPieces, setSelectedPieces] = useState([]);
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchFactureDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(`http://192.168.0.5:3006/facture/facturebyId/${idF}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedFacture = response.data.facture;
        if (fetchedFacture) {
          setFormData(prevData => ({
            ...prevData,
            num_fact: fetchedFacture.num_fact || '',
            num_po: fetchedFacture.num_po || '',
            date_fact: fetchedFacture.date_fact ? new Date(fetchedFacture.date_fact) : new Date(),
            montant: fetchedFacture.montant ? String(fetchedFacture.montant) : '',
            factname: fetchedFacture.factname || '',
            devise: fetchedFacture.devise || 'TND',
            nature: fetchedFacture.nature || '',
            objet: fetchedFacture.objet || '',
            datereception: fetchedFacture.datereception || '',
            pathpdf: fetchedFacture.pathpdf || '',
            piece_name: fetchedFacture.piece_name ? fetchedFacture.piece_name.split(',') : [],
            idfiscale: fetchedFacture.idfiscale || '',
            fournisseur: fetchedFacture.fournisseur || '',
          }));
        } else {
          console.error('Facture data not found in response');
        }
      } catch (error) {
        console.error('Error fetching facture details:', error);
      }
    };

    fetchFactureDetails();
  }, [idF]);

  const handleChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date_fact;
    setFormData(prevData => ({
      ...prevData,
      date_fact: currentDate,
    }));
  };

  const toggleCheckbox = (value) => {
    const isChecked = selectedPieces.includes(value);
    if (isChecked) {
      const updatedPieces = selectedPieces.filter(item => item !== value);
      setSelectedPieces(updatedPieces);
    } else {
      setSelectedPieces([...selectedPieces, value]);
    }
  };

  /*const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result && !result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      } else {
        Alert.alert('Erreur', 'Aucun fichier sélectionné');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erreur', 'Erreur lors du choix du document');
    }
  };*/
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
  
      console.log('DocumentPicker Result:', result);
  
      if (result.type === 'success') {
        setFileUri(result.uri);
        setFileName(result.name);
        setError(null);  
      } else {
        setError('Aucun fichier sélectionné');
      }
    } catch (error) {
      console.log('Error picking document:', error);
      setError('Error picking document');
    }
  };

  const changeDocuments = async () => {
    try {
      if (!fileUri) {
        Alert.alert('Erreur', 'Veuillez sélectionner un fichier PDF');
        return;
      }
  
      const formData = new FormData();
      formData.append('factureFile', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf',
      });
  
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(`http://192.168.0.5:3006/facture/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const extractedInfo = response.data.extractedInfo;
  
      setFormData(prevData => ({
        ...prevData,
        num_fact: extractedInfo.num_fact || prevData.num_fact,
        date_fact: extractedInfo.date_fact ? new Date(extractedInfo.date_fact) : prevData.date_fact,
        montant: extractedInfo.montant ? String(extractedInfo.montant) : prevData.montant,
      }));
  
      Alert.alert('Succès', 'Document mis à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du document.');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Update facture
      const updateFactureResponse = await axios.put(`http://192.168.0.5:3006/facture/updateFacture/${idF}`, {
        ...formData,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update pieces jointes
      const updatePiecesResponse = await axios.put(`http://192.168.0.5:3006/piecejoint/updatepiece/${idF}`, {
        piece_name: selectedPieces, // Send only the selected piece names as an array
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Succès', 'Facture et pièces jointes mises à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture ou des pièces jointes:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour de la facture ou des pièces jointes.');
    }
  };

  return (
    <View style={styles.container}>
     
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Modifier Facture</Text>
        <View style={styles.factureForm}>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Numéro de Facture:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.num_fact}
              onChangeText={(value) => handleChange('num_fact', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Numéro PO:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.num_po}
              onChangeText={(value) => handleChange('num_po', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Date de Facture:</Text>
            <DateTimePicker
              value={formData.date_fact}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Montant:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.montant}
              onChangeText={(value) => handleChange('montant', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Nom de Facture:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.factname}
              onChangeText={(value) => handleChange('factname', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Devise:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.devise}
              onChangeText={(value) => handleChange('devise', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Nature:</Text>
            <TextInput
              style={styles.factureInput}
              value={formData.nature}
              onChangeText={(value) => handleChange('nature', value)}
              placeholderTextColor="#3b1b0d"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Date de Réception:</Text>
            <DateTimePicker
              value={formData.date_fact}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Pièces Jointes :</Text>
            <View>
              {piecesJointesOptions.map(piece => (
                <TouchableOpacity key={piece.piece_name} onPress={() => toggleCheckbox(piece.piece_name)}>
                  <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, selectedPieces.includes(piece.piece_name) && styles.checked]} />
                    <Text style={{ color: '#3b1b0d' }}>{piece.piece_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fileInputContainer}>
            <TouchableOpacity style={styles.inputButton} onPress={pickFile}>
              <Text style={styles.inputButtonText}>Choisir un fichier</Text>
            </TouchableOpacity>
            <Text style={{ color: '#3b1b0d' }}>{fileName ? `Fichier choisi: ${fileName}` : 'Un seul PDF doit être téléchargé'}</Text>
          </View>
          <TouchableOpacity style={styles.inputButton} onPress={changeDocuments}>
            <Text style={styles.inputButtonText}>Modifier Document</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton} onPress={handleSubmit}>
            <Text style={styles.inputButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <Footer/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#eff0f6',
    margin:20,
    borderRadius:10,
    paddingBottom: 40,  
 
  
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#3b1b0d',
  },
  factureForm: {
    marginBottom: 30, 
  },
  formGroup: {
    marginBottom: 30,
  },
  factureLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#3b1b0d',
    marginLeft:5
  },
  factureInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#e0dfd8',
    color: '#3b1b0d',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#3b1b0d',
  },
  fileInputContainer: {
    marginBottom: 20,
  },
  inputButton: {
    backgroundColor: '#4367c4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  inputButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight:'bold'
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    
  },
});

export default UpdateFacture;