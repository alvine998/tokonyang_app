import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const HapusAkunScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const userId = user?.id;
    const [loading, setLoading] = useState(false);

    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bearer-token': 'tokotitohapi',
        'x-partner-code': 'id.marketplace.tokotitoh'
    };

    const handleDeleteAccount = async () => {
        if (!userId) {
            Alert.alert('Error', 'Sesi tidak ditemukan.');
            return;
        }

        Alert.alert(
            'Konfirmasi Hapus Akun',
            'Apakah Anda yakin ingin menghapus akun Tokotitoh Anda secara permanen? Tindakan ini tidak dapat dibatalkan.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await axios.delete(
                                `https://api.tokotitoh.co.id/user?id=${userId}`,
                                { headers: API_HEADERS }
                            );

                            if (response.status === 200 || response.status === 204) {
                                Alert.alert(
                                    'Berhasil',
                                    'Akun Anda telah berhasil dihapus.',
                                    [{
                                        text: 'OK',
                                        onPress: async () => {
                                            await logout();
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Login' }],
                                            });
                                        }
                                    }]
                                );
                            } else {
                                throw new Error('Gagal menghapus akun');
                            }
                        } catch (error: any) {
                            console.error('Delete account error:', error);
                            const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus akun.';
                            Alert.alert('Error', errMsg);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hapus Akun</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="warning-outline" size={80} color="#FF3B30" />
                </View>

                <Text style={styles.title}>Hapus Akun Anda?</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Apa yang akan terjadi:</Text>
                    <View style={styles.infoItem}>
                        <Icon name="close-circle-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Anda akan kehilangan akses ke akun dan semua data Anda.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Icon name="close-circle-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Iklan Anda yang sedang tayang akan dihapus.</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Icon name="close-circle-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Riwayat transaksi dan pesan akan hilang.</Text>
                    </View>
                </View>

                <Text style={styles.warningText}>
                    Tindakan ini permanen dan tidak dapat dipulihkan. Mohon pertimbangkan kembali sebelum melanjutkan.
                </Text>

                <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.disabledButton]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.deleteButtonText}>Hapus Akun Saya</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Batalkan</Text>
                </TouchableOpacity>
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
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    infoBox: {
        width: '100%',
        backgroundColor: '#F8F9FA',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
    warningText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HapusAkunScreen;
