import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
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
import UserAdsScreen from './src/screens/UserAdsScreen';
import SplashScreen from './src/screens/SplashScreen';
import NotificationListScreen from './src/screens/NotificationListScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import UbahPasswordScreen from './src/screens/UbahPasswordScreen';
import SyaratKetentuanScreen from './src/screens/SyaratKetentuanScreen';
import KebijakanPrivasiScreen from './src/screens/KebijakanPrivasiScreen';
import PusatBantuanScreen from './src/screens/PusatBantuanScreen';
import TentangTokotitohScreen from './src/screens/TentangTokotitohScreen';
import HapusAkunScreen from './src/screens/HapusAkunScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const JualButton = ({ children, onPress }: any) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (user) {
      navigation.navigate('Jual');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <TouchableOpacity
      style={{
        top: -10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={handlePress}>
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
};

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
      <AuthProvider>
        <View style={{ flex: 1, marginTop: 20 }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} options={{ animationTypeForReplace: 'pop' }} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Main" component={HomeTabs} />
              <Stack.Screen name="AdsList" component={AdsListScreen} />
              <Stack.Screen name="AdDetail" component={AdDetailScreen} />
              <Stack.Screen name="UserAds" component={UserAdsScreen} />
              <Stack.Screen name="NotificationList" component={NotificationListScreen} />
              <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="UbahPassword" component={UbahPasswordScreen} />
              <Stack.Screen name="SyaratKetentuan" component={SyaratKetentuanScreen} />
              <Stack.Screen name="KebijakanPrivasi" component={KebijakanPrivasiScreen} />
              <Stack.Screen name="PusatBantuan" component={PusatBantuanScreen} />
              <Stack.Screen name="TentangTokotitoh" component={TentangTokotitohScreen} />
              <Stack.Screen name="HapusAkun" component={HapusAkunScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}


export default App;
