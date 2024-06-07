import React from 'react';
import { View, StyleSheet } from 'react-native';
import Routers from '../routes/routes';

const Layout = () => {
  return (
    <View style={styles.container}>
      <Routers />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default Layout;
