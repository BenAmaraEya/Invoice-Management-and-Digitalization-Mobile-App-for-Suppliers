import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Footer = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching userId from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.navItem, navigation.isFocused() && styles.activeNavItem]}
        onPress={() => navigation.navigate(`Dashboard`, { userId })}
      >
        <Text style={styles.navText}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, navigation.isFocused() && styles.activeNavItem]}
        onPress={() => navigation.navigate(`Factures`, { userId })}
      >
        <Text style={styles.navText}>Factures</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width,
    height: 50,
    backgroundColor: '#4367c4',
    paddingBottom: 15,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  activeNavItem: {
    opacity: 0.7,
  },
  navText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Footer;
