import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';



import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import JualScreen from './src/screens/JualScreen';
import IklanSayaScreen from './src/screens/IklanSayaScreen';
import AkunSayaScreen from './src/screens/AkunSayaScreen';
import AdsListScreen from './src/screens/AdsListScreen';
import AdDetailScreen from './src/screens/AdDetailScreen';
import SplashScreen from './src/screens/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const JualButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}>
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Icon name="add" size={32} color="#000" />
    </View>
    <Text style={{ fontSize: 12, marginTop: 4, color: '#000', fontWeight: '800' }}>JUAL</Text>
  </TouchableOpacity>
);

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else if (route.name === 'Iklan Saya') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Akun Saya') {
            iconName = focused ? 'person' : 'person-outline';
          }

          if (route.name === 'Jual') return null;

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#757575',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen
        name="Jual"
        component={JualScreen}
        options={{
          tabBarButton: (props) => <JualButton {...props} />,
        }}
      />
      <Tab.Screen name="Iklan Saya" component={IklanSayaScreen} />
      <Tab.Screen name="Akun Saya" component={AkunSayaScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, marginTop: 20 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ animationTypeForReplace: 'pop' }} />
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="AdsList" component={AdsListScreen} />
            <Stack.Screen name="AdDetail" component={AdDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}


export default App;
