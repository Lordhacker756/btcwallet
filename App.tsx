import React from 'react';
import {View, ScrollView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {WalletProvider} from './context/WalletContext';
import MainScreen from './screens/MainScreen';
import GetStarted from './screens/GetStarted';
import CreateWallet, {
  ECPairInterface,
  Signer,
} from './screens/Onboarding/CreateWallet';
import ImportWallet from './screens/Onboarding/ImportWallet';
import GradientBackground from './components/GradientBackground';
import {colors} from './theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
global.Buffer = Buffer;
import * as bitcoin from 'bitcoinjs-lib';

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={MainScreen}
      options={{
        title: '',
        headerBackground: () => (
          <View style={{flex: 1, backgroundColor: colors.transparentColor}} />
        ),
      }}
    />
  </Stack.Navigator>
);

const GetStartedStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="GetStarted"
      component={GetStarted}
      options={{
        title: '',
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="CreateWallet"
      component={CreateWallet}
      options={{
        headerTitle: 'Create New Wallet',
      }}
    />
    <Stack.Screen
      name="ImportWallet"
      component={ImportWallet}
      options={{
        headerTitle: 'Import Existing Wallet',
      }}
    />
  </Stack.Navigator>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <WalletProvider>
          <GradientBackground>
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <Tab.Navigator
                screenOptions={({route}) => ({
                  tabBarStyle: {
                    display: route.name === 'GetStartedStack' ? 'none' : 'flex',
                  },
                })}>
                <Tab.Screen
                  name="GetStartedStack"
                  component={GetStartedStack}
                  options={{
                    tabBarLabel: 'Get Started',
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="HomeStack"
                  component={HomeStack}
                  options={{
                    tabBarLabel: 'Home',
                  }}
                />
              </Tab.Navigator>
            </ScrollView>
          </GradientBackground>
        </WalletProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
