import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
    Modal,
    Alert,
    TouchableWithoutFeedback,
    RefreshControl
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { formatAdDate } from '../utils/dateUtils';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

interface AdItem {
    id: number;
    title: string;
    price: string | number;
    image: string;
    status: 'AKTIF' | 'NONAKTIF' | 'DITOLAK' | '1' | '0' | '2' | 1 | 0 | 2;
    views?: number;
    favorites?: number;
    expiryDate?: string;
    province_name?: string;
    city_name?: string;
    originalData?: any;
}

const IklanSayaScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [mainTab, setMainTab] = useState<'MY_ADS' | 'SAVED_ADS'>('MY_ADS');
    const [activeTab, setActiveTab] = useState<'AKTIF' | 'NONAKTIF' | 'DITOLAK'>('AKTIF');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ads, setAds] = useState<AdItem[]>([]);

    // Menu state
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

    // Redirect to Login if user is not signed in
    useFocusEffect(
        React.useCallback(() => {
            if (!user) {
                navigation.navigate('Login');
            }
        }, [user, navigation])
    );

    const counts = useMemo(() => {
        const c = { AKTIF: 0, NONAKTIF: 0, DITOLAK: 0 };
        if (mainTab !== 'MY_ADS') return c;
        ads.forEach(ad => {
            if (ad.status === 'AKTIF' || ad.status === '1' || ad.status === 1) c.AKTIF++;
            else if (ad.status === 'NONAKTIF' || ad.status === '0' || ad.status === 0) c.NONAKTIF++;
            else if (ad.status === 'DITOLAK' || ad.status === '2' || ad.status === 2) c.DITOLAK++;
        });
        return c;
    }, [ads, mainTab]);

    const filteredAds = useMemo(() => {
        if (mainTab !== 'MY_ADS') return ads;
        return ads.filter(ad => {
            if (activeTab === 'AKTIF') return ad.status === 'AKTIF' || ad.status === '1' || ad.status === 1;
            if (activeTab === 'NONAKTIF') return ad.status === 'NONAKTIF' || ad.status === '0' || ad.status === 0;
            if (activeTab === 'DITOLAK') return ad.status === 'DITOLAK' || ad.status === '2' || ad.status === 2;
            return false;
        });
    }, [ads, activeTab, mainTab]);

    useEffect(() => {
        if (!user) return;

        if (mainTab === 'MY_ADS') {
            fetchUserAds();
        } else {
            fetchSavedAds();
        }
    }, [mainTab, user]); // Removed activeTab dependency as we filter locally

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        if (mainTab === 'MY_ADS') {
            await fetchUserAds(false);
        } else {
            await fetchSavedAds(false);
        }
        setRefreshing(false);
    }, [mainTab]);


    const fetchUserAds = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/ads?user_id=${user?.id}`, {
                headers: {
                    "bearer-token": "tokotitohapi",
                    "x-partner-code": "id.marketplace.tokotitoh",
                },
            });

            if (response.data && response.data.items && response.data.items.rows) {
                const mappedAds = response.data.items.rows.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.images ? JSON.parse(item.images)[0] : '',
                    status: item.status, // Preserve numeric status for frontend filtering
                    views: 0,
                    favorites: 0,
                    expiryDate: item.created_on,
                    originalData: item
                }));
                setAds(mappedAds);
            } else {
                setAds([]);
            }
        } catch (error) {
            console.error('Error fetching user ads:', error);
            setAds([]);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchSavedAds = async (showLoading = true) => {
        if (!user?.save_ads) {
            setAds([]);
            if (showLoading) setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);
        try {
            let savedIds: string[] = [];
            try {
                let parsed = JSON.parse(user.save_ads);

                // Handle cases where the backend double-stringified the JSON array
                if (typeof parsed === 'string' && parsed.startsWith('[')) {
                    try { parsed = JSON.parse(parsed); } catch (e) { }
                }

                if (Array.isArray(parsed)) {
                    savedIds = parsed.map(String);
                } else if (parsed !== null && parsed !== undefined) {
                    savedIds = [String(parsed)];
                }
            } catch (e) {
                // Handle non-JSON comma-separated strings or simple string values
                savedIds = String(user.save_ads).split(',').map(s => s.trim()).filter(Boolean);
            }

            if (savedIds.length === 0) {
                setAds([]);
                if (showLoading) setLoading(false);
                return;
            }

            // Fetch ads by IDs - Join with comma since API anticipates a string
            const response = await axios.get(`https://api.tokotitoh.co.id/ads?id=${savedIds.join(',')}`, {
                headers: {
                    "bearer-token": "tokotitohapi",
                    "x-partner-code": "id.marketplace.tokotitoh",
                },
            });

            if (response.data && response.data.items && response.data.items.rows) {
                const mappedAds = response.data.items.rows.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.images ? JSON.parse(item.images)[0] : '',
                    status: item.status === 1 ? 'AKTIF' : 'NONAKTIF',
                    views: 0,
                    favorites: 0,
                    expiryDate: item.created_on,
                    province_name: item.province_name,
                    city_name: item.city_name,
                    originalData: item
                }));
                setAds(mappedAds);
            } else {
                setAds([]);
            }
        } catch (error) {
            console.error('Error fetching saved ads:', error);
            setAds([]);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleEdit = () => {
        if (!selectedAd || !selectedAd.originalData) return;
        setMenuVisible(false);
        navigation.navigate('Jual', {
            editId: selectedAd.id,
            adData: selectedAd.originalData
        });
    };

    const handleDelete = () => {
        if (!selectedAd) return;
        setMenuVisible(false);

        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus iklan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await axios.delete(`https://api.tokotitoh.co.id/ads?id=${selectedAd.id}`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'bearer-token': 'tokotitohapi',
                                    'x-partner-code': 'id.marketplace.tokotitoh'
                                },
                            });

                            if (response.status === 200 || response.status === 204) {
                                Alert.alert('Sukses', 'Iklan berhasil dihapus');
                                fetchUserAds();
                            } else {
                                throw new Error('Gagal menghapus iklan');
                            }
                        } catch (error) {
                            console.error('Error deleting ad:', error);
                            Alert.alert('Error', 'Gagal menghapus iklan');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderTab = (label: string, type: 'AKTIF' | 'NONAKTIF' | 'DITOLAK', count: number) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === type && styles.activeTab]}
            onPress={() => setActiveTab(type)}
        >
            <AppText style={[styles.tabText, activeTab === type && styles.activeTabText]}>
                {label} ({count})
            </AppText>
        </TouchableOpacity>
    );

    const renderAdItem = ({ item }: { item: AdItem }) => (
        <TouchableOpacity
            style={styles.adCard}
            onPress={() => {
                const isRejected = item.status === 'DITOLAK' || item.status === '2' || item.status === 2;
                if (isRejected) return;
                navigation.navigate('AdDetail', { adId: item.id });
            }}
            activeOpacity={item.status === 'DITOLAK' || item.status === '2' || item.status === 2 ? 1 : 0.7}
        >
            <View style={styles.adMainRow}>
                <Image source={{ uri: item.image }} style={styles.adImage} />
                <View style={styles.adInfo}>
                    {/* <View style={styles.statusBadge}>
                        <AppText style={styles.statusText}>{item.status}</AppText>
                    </View> */}
                    <AppText style={styles.titleText} numberOfLines={2}>{item.title}</AppText>
                    <AppText style={styles.priceText}>
                        {typeof item.price === 'number'
                            ? `Rp ${item.price.toLocaleString('id-ID')}`
                            : item.price}
                    </AppText>
                    <View style={styles.metricsRow}>
                        {mainTab === 'MY_ADS' ? (
                            <>
                                {/* <View style={styles.metricItem}>
                                    <Icon name="eye-outline" size={14} color="#757575" />
                                    <AppText style={styles.metricText}>{item.views}</AppText>
                                </View>
                                <View style={styles.metricItem}>
                                    <Icon name="heart-outline" size={14} color="#757575" />
                                    <AppText style={styles.metricText}>{item.favorites}</AppText>
                                </View> */}
                            </>
                        ) : (
                            <View style={styles.locationRow}>
                                <Icon name="location-outline" size={14} color="#757575" />
                                <AppText style={styles.metricText}>
                                    {item.city_name?.includes("KABUPATEN") ? item.city_name?.replace("KABUPATEN", "KAB. ") : item.city_name}, {item.province_name}
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>
                {mainTab === 'MY_ADS' && !(item.status === 'DITOLAK' || item.status === '2' || item.status === 2) && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => {
                            setSelectedAd(item);
                            setMenuVisible(true);
                        }}
                    >
                        <Icon name="ellipsis-vertical" size={20} color="#002F34" />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.divider} />
            <View style={styles.adFooter}>
                <AppText style={styles.expiryText}>
                    {mainTab === 'MY_ADS' ? `Berakhir pada: ${formatAdDate(item.expiryDate || '')}` : `Ditambahkan pada: ${formatAdDate(item.expiryDate || '')}`}
                </AppText>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="megaphone-outline" size={80} color="#E0E0E0" />
            <AppText style={styles.emptyTitle}>
                {mainTab === 'MY_ADS'
                    ? (activeTab === 'AKTIF'
                        ? "Anda tidak memiliki iklan yang aktif"
                        : "Tidak ada iklan di sini")
                    : "Belum ada iklan tersimpan"}
            </AppText>
            <AppText style={styles.emptySubtitle}>
                {mainTab === 'MY_ADS'
                    ? "Mulai berjualan barang yang tidak terpakai dan hasilkan uang!"
                    : "Simpan iklan yang Anda sukai untuk melihatnya lagi di sini."}
            </AppText>
            {mainTab === 'MY_ADS' && (
                <TouchableOpacity
                    style={styles.sellButton}
                    onPress={() => navigation.navigate('Jual')}
                >
                    <AppText style={styles.sellButtonText}>MULAI BERJUALAN</AppText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <AppText style={styles.headerTitle}>Iklan Saya</AppText>
            </View>

            {/* Main Tabs */}
            <View style={styles.mainTabBar}>
                <TouchableOpacity
                    style={[styles.mainTab, mainTab === 'MY_ADS' && styles.activeMainTab]}
                    onPress={() => setMainTab('MY_ADS')}
                >
                    <AppText style={[styles.mainTabText, mainTab === 'MY_ADS' && styles.activeMainTabText]}>
                        Iklan Saya
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mainTab, mainTab === 'SAVED_ADS' && styles.activeMainTab]}
                    onPress={() => setMainTab('SAVED_ADS')}
                >
                    <AppText style={[styles.mainTabText, mainTab === 'SAVED_ADS' && styles.activeMainTabText]}>
                        Iklan Tersimpan
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* Status Tabs - only show for MY_ADS */}
            {mainTab === 'MY_ADS' && (
                <View style={styles.tabBar}>
                    {renderTab('AKTIF', 'AKTIF', counts.AKTIF)}
                    {renderTab('NONAKTIF', 'NONAKTIF', counts.NONAKTIF)}
                    {renderTab('DITOLAK', 'DITOLAK', counts.DITOLAK)}
                </View>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={filteredAds}
                    renderItem={renderAdItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#002F34']}
                            tintColor="#002F34"
                        />
                    }
                />
            )}

            {/* Action Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                                    <Icon name="create-outline" size={22} color="#002F34" />
                                    <AppText style={styles.menuItemText}>Edit Iklan</AppText>
                                </TouchableOpacity>
                                <View style={styles.menuDivider} />
                                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                                    <Icon name="trash-outline" size={22} color="#D9534F" />
                                    <AppText style={[styles.menuItemText, { color: '#D9534F' }]}>Hapus Iklan</AppText>
                                </TouchableOpacity>
                                <View style={styles.menuDivider} />
                                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                                    <Icon name="close-outline" size={22} color="#757575" />
                                    <AppText style={[styles.menuItemText, { color: '#757575' }]}>Batal</AppText>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F4F5',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    mainTabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    mainTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeMainTab: {
        borderBottomColor: '#002F34',
    },
    mainTabText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#757575',
    },
    activeMainTabText: {
        color: '#002F34',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#002F34',
    },
    tabText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#757575',
    },
    activeTabText: {
        color: '#002F34',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 12,
        flexGrow: 1,
    },
    adCard: {
        backgroundColor: '#fff',
        borderRadius: 4,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    adMainRow: {
        flexDirection: 'row',
        padding: 12,
    },
    adImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#F0F0F0',
    },
    adInfo: {
        flex: 1,
        marginLeft: 12,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E6F7F8',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#007A7C',
    },
    titleText: {
        fontSize: 14,
        color: '#002F34',
        marginBottom: 2,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
        marginBottom: 4,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    metricText: {
        fontSize: 12,
        color: '#757575',
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        paddingHorizontal: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 12,
    },
    adFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    expiryText: {
        fontSize: 11,
        color: '#757575',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
        textAlign: 'center',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    sellButton: {
        marginTop: 24,
        backgroundColor: '#002F34',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 4,
        borderWidth: 5,
        borderColor: '#FFCE32', // Yellow border style for OLX sell button
    },
    sellButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#002F34',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});

export default IklanSayaScreen;
