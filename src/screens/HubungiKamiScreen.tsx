import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    Image,
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const HubungiKamiScreen = () => {
    const navigation = useNavigation();

    const handleEmailPress = () => {
        Linking.openURL('mailto:cs@tokotitoh.co.id');
    };

    const handleWhatsappPress = () => {
        Linking.openURL('https://wa.me/6285213026262');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-back" size={24} color="#000" />
                    <AppText style={styles.backText}>Kembali</AppText>
                </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/tokotitoh.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Title */}
            <AppText style={styles.title}>Hubungi Kami</AppText>

            {/* Content */}
            <View style={styles.content}>
                <AppText style={styles.description}>
                    Jika Anda menemukan kendala dalam penggunaan aplikasi kami. Silahkan hubungi customer service kami melalui :
                </AppText>

                <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                    <Icon name="mail-outline" size={24} color="#3B82F6" />
                    <View style={styles.contactInfo}>
                        <AppText style={styles.contactLabel}>Email:</AppText>
                        <AppText style={styles.contactValue}>cs@tokotitoh.co.id</AppText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactItem} onPress={handleWhatsappPress}>
                    <Icon name="logo-whatsapp" size={24} color="#25D366" />
                    <View style={styles.contactInfo}>
                        <AppText style={styles.contactLabel}>Whatsapp:</AppText>
                        <AppText style={styles.contactValue}>(+62) 852-1302-6262</AppText>
                    </View>
                </TouchableOpacity>

                <AppText style={styles.footerText}>
                    Kritik, saran, dan masukan Anda sangat berharga bagi kami.
                </AppText>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginVertical: 20,
    },
    content: {
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 30,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    contactInfo: {
        marginLeft: 16,
    },
    contactLabel: {
        fontSize: 14,
        color: '#666',
    },
    contactValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginTop: 2,
    },
    footerText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginTop: 30,
        fontStyle: 'italic',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
    },
});

export default HubungiKamiScreen;
