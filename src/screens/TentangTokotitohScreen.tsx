import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const TentangTokotitohScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tentang Kami</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/tokotitoh.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.title}>Tokotitoh</Text>
                    <Text style={styles.description}>
                        Tokotitoh adalah merupakan layanan online untuk masyarakat khususnya pengguna di Indonesia dalam transaksi jual beli barang atau jasa. Tototitoh berusaha sebaik mungkin membangun transaksi di antara para pengguna untuk lebih saling menguntungkan cepat aman dan jujur. Sebagai website dan aplikasi online Tokotitoh berharap para pengguna dapat menggunakan dan menikmati layanan kami sebaik mungkin.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Tokotitoh. All rights reserved.</Text>
                    <Text style={styles.versionText}>Versi 1.0.0</Text>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 30,
        marginTop: 20,
    },
    logo: {
        width: 150,
        height: 150,
    },
    contentSection: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B733F',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        textAlign: 'justify',
    },
    footer: {
        marginTop: 50,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#999',
    },
    versionText: {
        fontSize: 12,
        color: '#bbb',
        marginTop: 5,
    },
});

export default TentangTokotitohScreen;
