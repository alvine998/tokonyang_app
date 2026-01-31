import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface MenuItemProps {
    icon: string;
    label: string;
    onPress?: () => void;
    showChevron?: boolean;
    color?: string;
}

const MenuItem = ({ icon, label, onPress, showChevron = true, color = '#002F34' }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
            <Icon name={icon} size={24} color={color} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color }]}>{label}</Text>
        </View>
        {showChevron && <Icon name="chevron-forward" size={20} color="#757575" />}
    </TouchableOpacity>
);

const AkunSayaScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                {user ? (
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Icon name="person-circle" size={80} color="#E0E0E0" />
                            <TouchableOpacity style={styles.editAvatarBtn}>
                                <Icon name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { userId: 1 })}>
                                <Text style={styles.editProfileText}>Lihat dan Edit Profil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.profileHeader}>
                        <TouchableOpacity
                            style={styles.loginRegisterBtn}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Icon name="person-circle" size={60} color="#E0E0E0" />
                            <View style={styles.loginRegisterTextContainer}>
                                <Text style={styles.loginRegisterTitle}>Login / Daftar</Text>
                                <Text style={styles.loginRegisterSubtitle}>Masuk ke akun Tokonyang Anda</Text>
                            </View>
                            <Icon name="chevron-forward" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Akun</Text>
                    <MenuItem icon="heart-outline" label="Favorit Saya" />
                    <MenuItem icon="notifications-outline" onPress={() => navigation.navigate('NotificationList')} label="Notifikasi" />
                    {user && <MenuItem icon="lock-closed-outline" onPress={() => navigation.navigate('ChangePassword')} label="Ubah Password" />}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dukungan</Text>
                    <MenuItem icon="help-circle-outline" label="Pusat Bantuan" onPress={() => navigation.navigate('PusatBantuan')} />
                    <MenuItem icon="information-circle-outline" label="Tentang Tokotitoh" onPress={() => navigation.navigate('TentangTokotitoh')} />
                    <MenuItem icon="document-text-outline" label="Syarat & Ketentuan" onPress={() => navigation.navigate('SyaratKetentuan')} />
                    <MenuItem icon="lock-closed-outline" label="Kebijakan Privasi" onPress={() => navigation.navigate('KebijakanPrivasi')} />
                    <MenuItem icon="trash-outline" label="Hapus Akun" color="#FF3B30" onPress={() => navigation.navigate('HapusAkun')} />
                </View>

                {/* Logout Button */}
                {user && (
                    <View style={styles.logoutContainer}>
                        <MenuItem
                            icon="log-out-outline"
                            label="Keluar"
                            color="#FF3B30"
                            showChevron={false}
                            onPress={handleLogout}
                        />
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Versi 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#002F34',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#002F34',
        marginBottom: 4,
    },
    editProfileText: {
        fontSize: 14,
        color: '#007A7C',
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
        marginLeft: 16,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 16,
        width: 24,
        textAlign: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutContainer: {
        backgroundColor: '#fff',
        marginTop: 8,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#757575',
    },
    loginRegisterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    loginRegisterTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    loginRegisterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    loginRegisterSubtitle: {
        fontSize: 14,
        color: '#757575',
        marginTop: 2,
    },
});

export default AkunSayaScreen;
