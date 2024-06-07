import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../pages/login';
import Dashboard from '../pages/dashboard';
import Header from '../components/Header'; // Import your Header component
import ListeFactures from '../pages/listfacture';
import FactureUploader from '../pages/uploadfacture';
import FactureForm from '../pages/formulaire';
import UpdateFacture from '../pages/updatefacture';
import UpdatePasswordForm from '../pages/updatepassword';
import ReclamationForm from '../pages/reclamation';

const Stack = createStackNavigator();

const Routers = () => {
  console.log("Routers component loaded");
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
      <Stack.Screen 
        name="Factures" 
        component={ListeFactures} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
       <Stack.Screen 
        name="UploadFacture" 
        component={FactureUploader} 
        options={{ 
         
         
        }} 
      />
       <Stack.Screen 
        name="FormFacture" 
        component={FactureForm} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
       <Stack.Screen 
        name="UpdateFacture" 
        component={UpdateFacture} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
      <Stack.Screen 
        name="UpdatePass" 
        component={UpdatePasswordForm} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
       <Stack.Screen 
        name="Reclamation" 
        component={ReclamationForm} 
        options={{ 
          header: () => <Header />,
         
        }} 
      />
    </Stack.Navigator>
  );
};

export default Routers;
