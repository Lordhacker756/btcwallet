import './shim';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {WalletProvider} from './context/WalletContext';
import {AuthProvider, useAuth} from './context/AuthContext';
import TabNavigation from './navigation/tabs/TabNavigation';
import AuthStack from './navigation/stacks/AuthStack';

global.Buffer = require('buffer').Buffer;

const AppContent = () => {
  const {isAuthenticated} = useAuth();
  return isAuthenticated ? <TabNavigation /> : <AuthStack />;
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
