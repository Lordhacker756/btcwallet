import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BitcoinStack from '../stacks/BitcoinStack';
import EthereumStack from '../stacks/EthereumStack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../theme/colors';
const Tab = createBottomTabNavigator();

const TabNavigation = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primaryButtonColor,
      tabBarInactiveTintColor: colors.secondary,
      tabBarStyle: {
        backgroundColor: 'black',
      },
    }}>
    <Tab.Screen
      name="BitcoinStack"
      component={BitcoinStack}
      options={{
        tabBarLabel: 'Bitcoin',
        tabBarIcon: ({color, size}) => (
          <Icon name="bitcoin" color={color} size={24} />
        ),
      }}
    />
    <Tab.Screen
      name="EthereumStack"
      component={EthereumStack}
      options={{
        tabBarLabel: 'Ethereum',
        tabBarIcon: ({color, size}) => (
          <Icon name="abacus" color={color} size={24} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default TabNavigation;
