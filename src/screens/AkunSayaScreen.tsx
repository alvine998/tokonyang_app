import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const AkunSayaScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                navigation.navigate('Login');
            }
        }, [user, navigation])
    );

    const handleLogout = async () => {
        await logout();
        navigation.navigate('Home');
    };

    const MenuItem = ({ label, onPress }: { label: string; onPress?: () => void }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <AppText style={styles.menuItemText}>{label}</AppText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                {user ? (
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Icon name="person-circle-outline" size={70} color="#000" />
                        </View>
                        <View style={styles.profileInfo}>
                            <AppText style={styles.userName}>{user.name}</AppText>
                            <AppText style={styles.userEmail}>{user.email}</AppText>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.profileHeader}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <View style={styles.avatarContainer}>
                            <Icon name="person-circle-outline" size={70} color="#000" />
                        </View>
                        <View style={styles.profileInfo}>
                            <AppText style={styles.userName}>Login / Daftar</AppText>
                            <AppText style={styles.userEmail}>Masuk ke akun Anda</AppText>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Edit Profile Button - only show when logged in */}
                {user && (
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <AppText style={styles.editProfileButtonText}>Ubah Profil</AppText>
                    </TouchableOpacity>
                )}

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {user && <MenuItem label="Pengaturan Akun" onPress={() => navigation.navigate('UbahPassword')} />}
                    {/* <MenuItem label="Download Aplikasi" /> */}
                    <MenuItem label="Pusat Bantuan" onPress={() => navigation.navigate('PusatBantuan')} />
                    <MenuItem label="Hubungi Kami" onPress={() => navigation.navigate('HubungiKami')} />
                    <MenuItem label="Tentang Kami" onPress={() => navigation.navigate('TentangTokotitoh')} />
                    <MenuItem label="Syarat & Ketentuan" onPress={() => navigation.navigate('SyaratKetentuan')} />
                    <MenuItem label="Kebijakan Privasi" onPress={() => navigation.navigate('KebijakanPrivasi')} />

                    {/* Version */}
                    <View style={styles.versionContainer}>
                        <AppText style={styles.versionText}>Versi 1.0.3</AppText>
                    </View>
                </View>

                {/* Logout Button - only show when logged in */}
                {user && (
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <AppText style={styles.logoutButtonText}>Keluar Akun</AppText>
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    avatarContainer: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    editProfileButton: {
        marginHorizontal: 20,
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    editProfileButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuContainer: {
        paddingHorizontal: 20,
    },
    menuItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 18,
        color: '#000',
        fontWeight: '500',
    },
    versionContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 16,
        color: '#666',
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AkunSayaScreen;
