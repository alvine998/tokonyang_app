import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const AkunSayaScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout, isLoading } = useAuth();

    useFocusEffect(
        useCallback(() => {
            // Use a slightly longer delay and check isLoading multiple times
            // to prevent race conditions during state transitions (like after OTP)
            const checkAuth = setTimeout(() => {
                console.log('AkunSaya: Redirection check - isLoading:', isLoading, 'user:', !!user);
                if (!isLoading && !user) {
                    console.log('AkunSaya: No user found and not loading, redirecting to Login');
                    navigation.navigate('Login');
                }
            }, 1000); // 1s is safer for full state propagation

            return () => clearTimeout(checkAuth);
        }, [user, isLoading, navigation])
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

    const getProfileImage = (imageStr: any) => {
        if (!imageStr) return null;
        try {
            if (typeof imageStr === 'string' && imageStr.startsWith('[')) {
                const parsed = JSON.parse(imageStr);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed[0];
                }
            }
            return imageStr;
        } catch (e) {
            return imageStr;
        }
    };

    const userImageUrl = getProfileImage((user as any)?.image);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                {user ? (
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {userImageUrl ? (
                                <Image
                                    source={{ uri: userImageUrl }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <Icon name="person-circle-outline" size={70} color="#000" />
                            )}
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
                    {user && <MenuItem label="Pengaturan Akun" onPress={() => navigation.navigate('PengaturanAkun')} />}
                    {/* <MenuItem label="Download Aplikasi" /> */}
                    <MenuItem label="Pusat Bantuan" onPress={() => navigation.navigate('PusatBantuan')} />
                    <MenuItem label="Hubungi Kami" onPress={() => navigation.navigate('HubungiKami')} />
                    <MenuItem label="Tentang Kami" onPress={() => navigation.navigate('TentangTokotitoh')} />
                    <MenuItem label="Syarat & Ketentuan" onPress={() => navigation.navigate('SyaratKetentuan')} />
                    <MenuItem label="Kebijakan Privasi" onPress={() => navigation.navigate('KebijakanPrivasi')} />

                    {/* Version */}
                    <View style={styles.versionContainer}>
                        <AppText style={styles.versionText}>Versi 1.0.22</AppText>
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
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
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
