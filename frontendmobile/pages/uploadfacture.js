import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

const FactureUploader = () => {
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  /*const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      console.log('DocumentPicker Result:', result);

      if (result && !result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
        setError(null);  
      } else {
        setError('Aucun fichier sélectionné');
      }
    } catch (error) {
      console.log('Error picking document:', error);
      setError('Error picking document');
    }
  };*/
  const pickDocument = async () => {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!fileUri) {
      setError('Veuillez choisir un PDF');
      setLoading(false);
      return;
    }

    const formData = new FormData();

    formData.append('factureFile', {
      uri: fileUri,
      name: fileName,
      type: 'application/pdf',
    });

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`http://192.168.0.5:3006/facture/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      

      const filePath = `uploads/${fileName}`;
      navigation.navigate('FormFacture', { extractedInfo: data.extractedInfo, filePath: filePath });
    } catch (error) {
      console.log('Error uploading facture:', error);
      setError('Error uploading facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Télécharger Documents</Text>
      <View style={styles.fileInputContainer}>
        <TouchableOpacity style={styles.inputButton} onPress={pickDocument}>
          <Text style={styles.inputButtonText}>Choisir un fichier</Text>
        </TouchableOpacity>
        <Text>{fileName ? `Fichier choisi: ${fileName}` : 'Un seul PDF doit être téléchargé'}</Text>
        <Text>Max 50 Mo</Text>
      </View>
      <TouchableOpacity
        style={[styles.uploadBtn, loading ? styles.uploadBtnLoading : null]}
        onPress={handleSubmit}
        disabled={!fileUri || loading}
      >
        <Text style={styles.uploadBtnText}>{loading ? 'Uploading...' : 'Upload'}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  fileInputContainer: {
    marginBottom: 20,
  },
  inputButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  inputButtonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  uploadBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
  },
  uploadBtnText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  uploadBtnLoading: {
    backgroundColor: '#0056b3',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default FactureUploader;
