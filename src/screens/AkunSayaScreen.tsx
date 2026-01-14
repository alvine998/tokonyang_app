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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Icon name="person-circle" size={80} color="#E0E0E0" />
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Icon name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>User Tokonyang</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { userId: 1 })}>
                            <Text style={styles.editProfileText}>Lihat dan Edit Profil</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Akun</Text>
                    <MenuItem icon="heart-outline" label="Favorit Saya" />
                    <MenuItem icon="notifications-outline" onPress={() => navigation.navigate('NotificationList')} label="Notifikasi" />
                    <MenuItem icon="lock-closed-outline" onPress={() => navigation.navigate('ChangePassword')} label="Ubah Password" />
                </View>

                {/* Settings Section */}
                {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pengaturan</Text>
                    <MenuItem icon="settings-outline" label="Pengaturan Akun" />
                    <MenuItem icon="language-outline" label="Bahasa" />
                </View> */}

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dukungan</Text>
                    <MenuItem icon="help-circle-outline" label="Pusat Bantuan" />
                    <MenuItem icon="information-circle-outline" label="Tentang Tokonyang" />
                    <MenuItem icon="document-text-outline" label="Syarat & Ketentuan" />
                    <MenuItem icon="lock-closed-outline" label="Kebijakan Privasi" />
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <MenuItem
                        icon="log-out-outline"
                        label="Keluar"
                        color="#FF3B30"
                        showChevron={false}
                        onPress={() => { }}
                    />
                </View>

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
});

export default AkunSayaScreen;
