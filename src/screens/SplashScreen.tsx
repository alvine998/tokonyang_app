import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';

const SplashScreen = ({ navigation }: any) => {

    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Main');
        }, 2000);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/tokotitoh.png')} style={{ width: 150, height: 150 }} />
        </View>
    );
};

export default SplashScreen;