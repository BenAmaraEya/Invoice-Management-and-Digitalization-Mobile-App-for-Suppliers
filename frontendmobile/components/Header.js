import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCog, faBell } from "@fortawesome/free-solid-svg-icons";
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notificationsEtat, setNotificationsEtat] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  
  const handleUpdatePassword = () => {
    navigation.navigate('UpdatePass', { userId: userId });
    setIsUserMenuOpen(false);
  };

  const handleReclamation = () => {
    navigation.navigate('Reclamation', { userId: userId });
    setIsUserMenuOpen(false);   };
    
  useEffect(() => {
    const fetchStoredNotifications = async () => {
      try {
        const storedNotificationsJSON = await AsyncStorage.getItem("notificationEtat");
        if (storedNotificationsJSON) {
          const storedNotifications = JSON.parse(storedNotificationsJSON);
          setNotificationsEtat(storedNotifications);
        }
      } catch (error) {
        console.error("Error fetching stored notifications:", error);
      }
    };
    fetchStoredNotifications();

    const socket = io('http://192.168.0.5:3006');
    socket.on('newStatuts', (statut, num) => {
      try {
        const newNotification = { message: { statut, num } };
        setNotificationsEtat(prevNotificationsEtat => {
          const updatedNotificationEtat = [...prevNotificationsEtat, newNotification];
          AsyncStorage.setItem("notificationEtat", JSON.stringify(updatedNotificationEtat));
          return updatedNotificationEtat;
        });
      } catch (error) {
        console.error("Error adding new notification:", error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleToggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`http://192.168.0.5:3006/auth/logout/${userId}`, {}, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("userId");
        console.log("Token removed");
        navigation.navigate('Login');
      } else {
        console.error("Failed to logout:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <View style={styles.header}>
      <View style={styles.navigation}>
        <View style={styles.menu}>
          <TouchableOpacity onPress={handleToggleUserMenu} style={styles.navItem}>
            <FontAwesomeIcon icon={faCog} style={styles.icon}  size={20} />
          </TouchableOpacity>
          {isUserMenuOpen && (
            <View style={styles.dropdownContent}>
              <TouchableOpacity onPress={handleReclamation} style={styles.dropdownItem}>
                <Text>reclamations </Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={handleUpdatePassword} style={styles.dropdownItem}>
                <Text>modifier mot de passe </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                <Text>deconnexion</Text>
              </TouchableOpacity>

            </View>
          )}
          <TouchableOpacity onPress={handleToggleNotificationMenu} style={styles.navItem}>
            <FontAwesomeIcon icon={faBell} style={styles.notifIcon} size={20} />
            {notificationsEtat.length > 0 && (
              <View style={styles.notificationBadgeContainer}>
                <Text>{notificationsEtat.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {isNotificationMenuOpen && (
            <View style={styles.dropdownnotif}>
              {notificationsEtat.length === 0 ? (
                <Text>No new notifications</Text>
              ) : (
                notificationsEtat.map((notif, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      const updatedNotifications = notificationsEtat.filter((_, idx) => idx !== index);
                      setNotificationsEtat(updatedNotifications);
                      AsyncStorage.setItem("notificationEtat", JSON.stringify(updatedNotifications));
                    }}
                    style={styles.notificationItem}
                  >
                    <Text>N°: {notif.message.statut.num} - {notif.message.statut.statuts}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4367c4',
   padding:10,
   marginTop:20,
   marginBottom:10
  },
  navigation: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20, // Remove justifyContent to allow space-between effect
  },
  navItem: {
    padding: 10,
  },
  icon: {
    marginRight: 8, // Add right margin to the icon
    color: '#3B1B0D', // Change icon color to white
  },
  notifIcon: {
    marginRight: 10, // Add right margin to the notification bell icon
    color: '#3B1B0D',
   // Change icon color to white
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    right: 60, // Align dropdown content to the right
    backgroundColor: '#fff',
    zIndex: 1,
    padding: 8,
    borderRadius: 5,
    elevation: 3,
  },
  dropdownnotif: {
    position: 'absolute',
    top: '100%',
    right: 0, // Align dropdown content to the right
    width: 200, // Set a fixed width for the dropdown
    backgroundColor: '#fff',
    zIndex: 1,
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  notificationBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: 13, // Adjust position to the right
    backgroundColor: 'red', // Change background color to red
    borderRadius: 10, // Add border radius for a rounded shape
    paddingHorizontal: 5, // Add horizontal padding for better appearance
  },
  notificationItem: {
    paddingVertical: 10,
  },
};


export default Header;
