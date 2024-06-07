import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRoute} from '@react-navigation/native';
import Footer from '../components/Footer';

const UpdatePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { userId } = route.params;

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await axios.put(`http://192.168.0.5:3006/user/updatePass/${userId}`, formData);

      if (response.status !== 200) {
        throw new Error("erreur de mettre a jour de mot de passe ");
      }

      
      Alert.alert('mot de passe mise a jour avec succés');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>Ancient mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          value={formData.oldPassword}
          onChangeText={value => handleChange("oldPassword", value)}
        />
      </View>
      <View>
        <Text>Nouveau mot de passe </Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          value={formData.newPassword}
          onChangeText={value => handleChange("newPassword", value)}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
      <Footer/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default UpdatePasswordForm;
