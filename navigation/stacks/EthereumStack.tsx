import CreateWallet from '../../screens/Ethereum/CreateWallet';
import ImportWallet from '../../screens/Ethereum/ImportWallet';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const EthereumStack = () => (
  <Stack.Navigator>
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

export default EthereumStack;
