import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MenuScreen = () => {
    const navigation = useNavigation<any>();
    const [isTipsModalVisible, setIsTipsModalVisible] = useState(false);
    const [isAdsModalVisible, setIsAdsModalVisible] = useState(false);

    useEffect(() => {
        const parent = navigation.getParent();
        if (parent) {
            if (isTipsModalVisible || isAdsModalVisible) {
                parent.setOptions({
                    tabBarStyle: { display: 'none' }
                });
            } else {
                parent.setOptions({
                    tabBarStyle: {
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 10,
                        display: 'flex'
                    }
                });
            }
        }
    }, [isTipsModalVisible, isAdsModalVisible, navigation]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Menu</Text>
                </View>

                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setIsTipsModalVisible(true)}
                    >
                        <Text style={styles.menuButtonText}>Tips Hindari Penipuan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setIsAdsModalVisible(true)}
                    >
                        <Text style={styles.menuButtonText}>Cara Beriklan</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Modal
                visible={isTipsModalVisible}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setIsTipsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tips Hindari Penipuan</Text>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>• Hindari pembelian Non COD</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>• Hindari DP transfer sebelum bertemu langsung dengan penjual. Periksa surat surat dan kelengkapan barang</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>• Untuk pembelian properti, Cek surat surat dan kondisi situasi tanah dengan teliti sesuai ketentuan yg berlaku</Text>
                            </View>

                            <View style={styles.warningContainer}>
                                <Text style={styles.warningTitle}>Awas Waspada Penipuan Segitiga</Text>
                                <Text style={styles.warningDescription}>
                                    adalah penipuan di mana si pelaku penipuan tidak pernah bertemu dengan korban nya si penipu menawarkan barang / bisa berupa kendaraan atau lainnya dengan harga murah dimana penipu berpura pura sebagai pemilik atau calo yg menawarkan barang yg dijual oleh seseorang di internet dan penipuan mengiklankan sendiri barang orang penjual dengan harga murah and si penjual diatur untuk mengikuti permainan nya sedemikian rupa dan calon pembeli ketika bertemu penjual dan merasa cocok dengan barang tersebut kemudian pembeli disuruh transfer ke rekening penipu yg hanya dihubungi oleh whatsapp atau telepon dan jika pembeli mentransfer uang ke rekening penipu maka uang nya akan hilang diambil penipu Jadi untuk menghindari penipuan jenis ini maka pembeli harus menegaskan dan mengkonfirmasi kepada orang yang kita temui secara langsung untuk masalah pembayaran ke rekening yg harus disetujui oleh orang yg kita temui secara langsung karena orang yg kita temui secara langsung adalah orang yg diberi / mempunyai kuasa atas barang kendaraan tersebut.
                                </Text>
                            </View>
                        </ScrollView>
                        <SafeAreaView style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsTipsModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Tutup</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isAdsModalVisible}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setIsAdsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Cara Beriklan</Text>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>1. Buat judul iklan yang baik</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>2. Cantumkan nomor kontak telepon dan WA yang aktif</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>3. Pilih kategori yang sesuai</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>4. Pasang foto yang berkualitas</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipText}>5. Memberikan detail informasi barang dengan lengkap dan akurat</Text>
                            </View>
                        </ScrollView>
                        <SafeAreaView style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsAdsModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Tutup</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        paddingHorizontal: 20,
        gap: 12,
    },
    menuButton: {
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonText: {
        fontSize: 18,
        color: '#000',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        flex: 1,
        marginTop: '20%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    modalBody: {
        padding: 20,
    },
    tipItem: {
        marginBottom: 12,
    },
    tipText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    warningContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#B91C1C',
        marginBottom: 10,
    },
    warningDescription: {
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 20,
        textAlign: 'justify',
    },
    modalFooter: {
        paddingBottom: 20,
    },
    closeButton: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MenuScreen;
