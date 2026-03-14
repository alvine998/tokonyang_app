import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PengaturanAkunScreen = () => {
    const navigation = useNavigation<any>();

    const MenuItem = ({ label, onPress, icon }: { label: string; onPress?: () => void; icon: string }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemContent}>
                <Icon name={icon} size={24} color="#002F34" style={styles.menuIcon} />
                <AppText style={styles.menuItemText}>{label}</AppText>
            </View>
            <Icon name="chevron-forward" size={20} color="#757575" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={28} color="#002F34" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Pengaturan Akun</AppText>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.menuContainer}>
                    <MenuItem 
                        label="Ubah Password" 
                        icon="key-outline"
                        onPress={() => navigation.navigate('UbahPassword')} 
                    />
                    <MenuItem 
                        label="Hapus Akun" 
                        icon="trash-outline"
                        onPress={() => navigation.navigate('HapusAkun')} 
                    />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    content: {
        flex: 1,
    },
    menuContainer: {
        marginTop: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuItemText: {
        fontSize: 16,
        color: '#002F34',
        fontWeight: '500',
    },
});

export default PengaturanAkunScreen;
