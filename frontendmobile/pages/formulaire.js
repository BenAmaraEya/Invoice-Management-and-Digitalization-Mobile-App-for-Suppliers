import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Footer from '../components/Footer';

/*const RadioButton = ({ selected, onSelect }) => (
  <TouchableOpacity onPress={onSelect} style={styles.radio}>
    {selected ? <View style={styles.radioDot} /> : null}
  </TouchableOpacity>
);*/

const FactureForm = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
 const {API}='192.168.0.5';
  const [formData, setFormData] = useState({
    num_fact: '',
    num_po: '',
    date_fact: new Date(),
    montant: '',
    factname: '',
    devise: 'TND',
    nature: '3WMTND',
    objet: 'NOUVELLE FACTURE',
    datereception: new Date().toISOString().split('T')[0],
    pathpdf: '',
    idfiscale: '',
    fournisseur: '',
    delai_paiement: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    piece_name: [],
  });

  useEffect(() => {
    const extractedInfo = route.params?.extractedInfo || {};
    const filepath = route.params?.filePath || {};

    setFormData(prevData => ({
      ...prevData,
      num_fact: extractedInfo.num_fact || '',
      date_fact: extractedInfo.date_fact ? new Date(extractedInfo.date_fact) : new Date(),
      montant: extractedInfo.montant ? String(extractedInfo.montant) : '',
      pathpdf: filepath,
    }));

    fetchFournisseurIdFiscale();
    fetchFournisseurName();
  }, [route.params]);

  const fetchFournisseurIdFiscale = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const result = await axios.get(`http://${API}:3006/fournisseur/userId/` + id);
      const fournisseurIdFiscale = result.data.fournisseur.idfiscale;
      setFormData(prevData => ({
        ...prevData,
        idfiscale: fournisseurIdFiscale,
      }));
    } catch (error) {
      console.error('Erreur de récuperation de l idfiscale de fournisseur:', error);
    }
  };

  const fetchFournisseurName = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const result = await axios.get(`http://192.168.0.5:3006/user/` + id);

      if (result.data && result.data.name) {
        const fournisseur = result.data.name;
        setFormData(prevData => ({
          ...prevData,
          fournisseur: fournisseur,
        }));
      } else {
        console.error('utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Erreur de récuperation de nom :', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const id = await AsyncStorage.getItem('userId');
      const result = await axios.get(`http://192.168.0.5:3006/fournisseur/userId/${id}`);
      const fournisseurIdFiscal = result.data.fournisseur.idfiscale;

      setFormData(prevData => ({
        ...prevData,
        idfiscale: fournisseurIdFiscal,
      }));
      let iderp = result.data.fournisseur.iderp;
      const response = await axios.post(`http://192.168.0.5:3006/facture/save/`+iderp, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Données de facture ajouter avec succée.');
      alert('Données de facture ajouter avec succée.');
      const factureId = response.data.facture.idF;
      console.log('Facture ID:', factureId);

      const requestData = {
        piece_name: formData.piece_name,
        idFacture: factureId,
      };

      await axios.post('http://192.168.0.5:3006/piecejoint/addpiece', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Piece joint ajouté avec succée.');
      alert('Piece joint ajouté avec succée .');

      navigation.navigate('Factures',{ userId: id });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  const toggleCheckbox = (value) => {
    const isChecked = formData.piece_name.includes(value);
    if (isChecked) {
      const updatedPieceNames = formData.piece_name.filter(item => item !== value);
      setFormData(prevData => ({
        ...prevData,
        piece_name: updatedPieceNames,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        piece_name: [...prevData.piece_name, value],
      }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Vérifiez avant de soumettre.</Text>
        <View style={styles.factureForm}>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Nature 3WM:*</Text>
            <TextInput
              style={styles.factureInput}
              name="nature"
              value={formData.nature}
              onChangeText={(value) => handleChange('nature', value)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Numéro PO:*</Text>
            <TextInput
              style={styles.factureInput}
              name="num_po"
              value={formData.num_po}
              onChangeText={(value) => handleChange('num_po', value)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>fournisseur:*</Text>
            <TextInput
              style={styles.factureInput}
              name="name"
              value={formData.fournisseur}
              onChangeText={(value) => handleChange('fournisseur', value)}
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Id Fiscal:*</Text>
            <TextInput
              style={styles.factureInput}
              name="idfiscale"
              value={formData.idfiscale}
              onChangeText={(value) => handleChange('idfiscale', value)}
              editable={true}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Numéro de Facture:*</Text>
            <TextInput
              style={styles.factureInput}
              name="num_fact"
              value={formData.num_fact}
              onChangeText={(value) => handleChange('num_fact', value)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Date de facture:*</Text>
            <DateTimePicker
              value={formData.date_fact}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || formData.date_fact;
                handleChange('date_fact', currentDate);
              }}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Nom de Facture:*</Text>
            <TextInput
              style={styles.factureInput}
              name="factname"
              value={formData.factname}
              onChangeText={(value) => handleChange('factname', value)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Montant:*</Text>
            <TextInput
              style={styles.factureInput}
              name="montant"
              value={formData.montant}
              onChangeText={(value) => handleChange('montant', value)}
              keyboardType="numeric"
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Devise:*</Text>
            <TextInput
              style={styles.factureInput}
              name="devise"
              value={formData.devise}
              onChangeText={(value) => handleChange('devise', value)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Object:*</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                selected={formData.objet === 'NOUVELLE FACTURE'}
                onSelect={() => handleChange('objet', 'NOUVELLE FACTURE')}
              />
              <Text style={styles.radioLabel}>NOUVELLE FACTURE</Text>
              <RadioButton
                selected={formData.objet === 'AUTRE'}
                onSelect={() => handleChange('objet', 'AUTRE')}
              />
              <Text style={styles.radioLabel}>AUTRE</Text>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Pièces Jointes :*</Text>
            <View>
              <TouchableOpacity onPress={() => toggleCheckbox('bon de command')}>
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, formData.piece_name.includes('bon de command') && styles.checked]} />
                  <Text>Bon de Commande</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleCheckbox('pv de reception')}>
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, formData.piece_name.includes('pv de reception') && styles.checked]} />
                  <Text>PV de Reception</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.factureLabel}>Delai de Paiement:*</Text>
            <TextInput
              style={styles.factureInput}
              name="delai_paiement"
              value={formData.delai_paiement}
              onChangeText={(value) => handleChange('delai_paiement', value)}
              editable={false}
            />
          </View>
          <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.submitFormBtn} onPress={handleSubmit}>
              <Text  style={styles.textbtnvalider}>Deposer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelFormBtn} onPress={() => navigation.navigate('Factures',{ userId: id })}>
              <Text style={styles.textbtnannuler}>Annuler</Text>
            </TouchableOpacity>
          
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#eff0f6',
    margin:20,
    paddingBottom: 60,  
 
    borderRadius:10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#3b1b0d',
  },
  factureForm: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
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
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  cancelFormBtn: {
    backgroundColor: '#ccc',
   height:40,
    borderRadius: 5,
    width:100,
    
    
   
  },
  submitFormBtn: {
    backgroundColor: '#4367c4',
    height:40,
    borderRadius: 5,
    width:100,
    marginLeft:80,
    
  },
  textbtnannuler:{
    textAlign:'center',
    fontWeight:'bold',
    paddingTop:10
  },
  textbtnvalider:{
    textAlign:'center',
    color:'#fff',
    fontWeight:'bold',
    paddingTop:10
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
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radio: {
    borderWidth: 1,
    borderColor: '#3b1b0d',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b1b0d',
  },
  radioLabel: {
    fontSize: 13,
    marginRight: 13,
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

export default FactureForm;