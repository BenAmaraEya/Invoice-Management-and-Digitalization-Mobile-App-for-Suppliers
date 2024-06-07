import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getIpAddressAsync } from 'expo-network';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localIp, setLocalIp] = useState(null);
const AdresseIp='192.168.0.5'
  const navigation = useNavigation();

  useEffect(() => {
    setCredentials({
      username: '',
      password: '',
    });
  }, []);

 /* useEffect(() => {
    const fetchLocalIpAddress = async () => {
      try {
        const ipAddress = await getIpAddressAsync(); 
        setLocalIp(ipAddress);
      } catch (error) {
        console.error('Error fetching local IP address:', error);
      }
    };

    fetchLocalIpAddress();
  }, []);*/

  const handleInputChange = (field, value) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`http://${AdresseIp}:3006/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data) {
        throw new Error('Invalid credentials');
      }

      const { token, id, profil } = response.data;

      AsyncStorage.setItem('accessToken', token);
      AsyncStorage.setItem('userId', id.toString());
      AsyncStorage.setItem('userProfil', profil);

      navigation.navigate('Dashboard', { userId: id });

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenue</Text>
      <View style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#000" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Entez votre nom"
            value={credentials.username}
            onChangeText={(text) => handleInputChange('username', text)}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#000" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            value={credentials.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'connexion'}
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4367c4',
  },
  welcomeText: {
    color: '#3B1B0D',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,

  },
  loginContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#e0e6e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',

  },
  buttonText: {
    color: '#3B1B0D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Login;
