import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from '../../screens/Bitcoin/MainScreen';
import {colors} from '../../theme/colors';
import {View} from 'react-native';

const Stack = createNativeStackNavigator();

const BitcoinStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Bitcoin" component={MainScreen} />
  </Stack.Navigator>
);

export default BitcoinStack;
