import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { formatAdDate } from '../utils/dateUtils';
import axios from 'axios';

const { width } = Dimensions.get('window');

interface AdItem {
    id: number;
    title: string;
    price: string | number;
    image: string;
    status: 'AKTIF' | 'NONAKTIF' | 'DITOLAK' | '1' | '0' | '2';
    views?: number;
    favorites?: number;
    expiryDate?: string;
    province_name?: string;
    city_name?: string;
}

const IklanSayaScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [mainTab, setMainTab] = useState<'MY_ADS' | 'SAVED_ADS'>('MY_ADS');
    const [activeTab, setActiveTab] = useState<'AKTIF' | 'NONAKTIF' | 'DITOLAK'>('AKTIF');
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState<AdItem[]>([]);

    // Redirect to Login if user is not signed in
    useFocusEffect(
        React.useCallback(() => {
            if (!user) {
                navigation.navigate('Login');
            }
        }, [user, navigation])
    );

    useEffect(() => {
        if (!user) return;

        if (mainTab === 'MY_ADS') {
            fetchUserAds();
        } else {
            fetchSavedAds();
        }
    }, [mainTab, activeTab, user]);

    const fetchUserAds = async () => {
        setLoading(true);
        try {
            // Mapping status for API
            const statusMap = {
                'AKTIF': '1',
                'NONAKTIF': '0',
                'DITOLAK': '2'
            };

            const response = await axios.get(`https://api.tokotitoh.co.id/ads?user_id=${user?.id}&status=${statusMap[activeTab]}`, {
                headers: {
                    "bearer-token": "tokotitohapi",
                    "x-partner-code": "id.marketplace.tokotitoh",
                },
            });

            console.log(user)

            console.log(response.data.items.rows, "response data")

            if (response.data && response.data.items && response.data.items.rows) {
                const mappedAds = response.data.items.rows.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.images ? JSON.parse(item.images)[0] : '',
                    status: activeTab,
                    views: 0, // Not provided by API currently
                    favorites: 0,
                    expiryDate: item.created_on // Using created_on as placeholder if expired_on is missing
                }));
                setAds(mappedAds);
            } else {
                setAds([]);
            }
        } catch (error) {
            console.error('Error fetching user ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedAds = async () => {
        if (!user?.save_ads) {
            setAds([]);
            setLoading(false);
            return;
        }

        setLoading(true);
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
                setLoading(false);
                return;
            }
            console.log(savedIds, "parsed savedIds");

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
                    city_name: item.city_name
                }));
                setAds(mappedAds);
            } else {
                setAds([]);
            }
        } catch (error) {
            console.error('Error fetching saved ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
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
            onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
        >
            <View style={styles.adMainRow}>
                <Image source={{ uri: item.image }} style={styles.adImage} />
                <View style={styles.adInfo}>
                    <View style={styles.statusBadge}>
                        <AppText style={styles.statusText}>{item.status}</AppText>
                    </View>
                    <AppText style={styles.titleText} numberOfLines={2}>{item.title}</AppText>
                    <AppText style={styles.priceText}>
                        {typeof item.price === 'number'
                            ? `Rp ${item.price.toLocaleString('id-ID')}`
                            : item.price}
                    </AppText>
                    <View style={styles.metricsRow}>
                        {mainTab === 'MY_ADS' ? (
                            <>
                                <View style={styles.metricItem}>
                                    <Icon name="eye-outline" size={14} color="#757575" />
                                    <AppText style={styles.metricText}>{item.views}</AppText>
                                </View>
                                <View style={styles.metricItem}>
                                    <Icon name="heart-outline" size={14} color="#757575" />
                                    <AppText style={styles.metricText}>{item.favorites}</AppText>
                                </View>
                            </>
                        ) : (
                            <View style={styles.locationRow}>
                                <Icon name="location-outline" size={14} color="#757575" />
                                <AppText style={styles.metricText}>
                                    {item.city_name}, {item.province_name}
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>
                {mainTab === 'MY_ADS' && (
                    <TouchableOpacity style={styles.menuButton}>
                        <Icon name="ellipsis-vertical" size={20} color="#002F34" />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.divider} />
            <View style={styles.adFooter}>
                <AppText style={styles.expiryText}>
                    {mainTab === 'MY_ADS' ? `Berakhir pada: ${formatAdDate(item.expiryDate || '')}` : `Ditambahkan pada: ${formatAdDate(item.expiryDate || '')}`}
                </AppText>
                {mainTab === 'MY_ADS' && (
                    <TouchableOpacity style={styles.boostButton}>
                        <AppText style={styles.boostButtonText}>TINGKATKAN IKLAN</AppText>
                    </TouchableOpacity>
                )}
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
                    {renderTab('AKTIF', 'AKTIF', 0)}
                    {renderTab('NONAKTIF', 'NONAKTIF', 0)}
                    {renderTab('DITOLAK', 'DITOLAK', 0)}
                </View>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={ads}
                    renderItem={renderAdItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    boostButton: {
        backgroundColor: '#002F34',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
    },
    boostButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
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
});

export default IklanSayaScreen;
