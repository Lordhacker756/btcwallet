import GetStarted from '../../screens/GetStarted';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="GetStarted" component={GetStarted} />
  </Stack.Navigator>
);

export default AuthStack;
