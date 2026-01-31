import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }: any) => {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                navigation.replace('Main');
            }, 2000);
        }
    }, [isLoading, navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/tokotitoh.png')} style={{ width: 150, height: 150 }} />
        </View>
    );
};

export default SplashScreen;