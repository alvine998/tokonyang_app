import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AdItem {
    id: number;
    title: string;
    price: string;
    image: string;
    status: 'AKTIF' | 'NONAKTIF' | 'DITOLAK';
    views: number;
    favorites: number;
    expiryDate: string;
}

const IklanSayaScreen = () => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<'AKTIF' | 'NONAKTIF' | 'DITOLAK'>('AKTIF');
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState<AdItem[]>([]);

    useEffect(() => {
        // Simulate fetching user's ads
        setLoading(true);
        setTimeout(() => {
            // Mock data empty for AKTIF to show empty state, or populated for demo
            setAds([]);
            setLoading(false);
        }, 800);
    }, [activeTab]);

    const renderTab = (label: string, type: 'AKTIF' | 'NONAKTIF' | 'DITOLAK', count: number) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === type && styles.activeTab]}
            onPress={() => setActiveTab(type)}
        >
            <Text style={[styles.tabText, activeTab === type && styles.activeTabText]}>
                {label} ({count})
            </Text>
        </TouchableOpacity>
    );

    const renderAdItem = ({ item }: { item: AdItem }) => (
        <View style={styles.adCard}>
            <View style={styles.adMainRow}>
                <Image source={{ uri: item.image }} style={styles.adImage} />
                <View style={styles.adInfo}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                    <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.priceText}>{item.price}</Text>
                    <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                            <Icon name="eye-outline" size={14} color="#757575" />
                            <Text style={styles.metricText}>{item.views}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Icon name="heart-outline" size={14} color="#757575" />
                            <Text style={styles.metricText}>{item.favorites}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Icon name="ellipsis-vertical" size={20} color="#002F34" />
                </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.adFooter}>
                <Text style={styles.expiryText}>Berakhir pada: {item.expiryDate}</Text>
                <TouchableOpacity style={styles.boostButton}>
                    <Text style={styles.boostButtonText}>TINGKATKAN IKLAN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="megaphone-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>
                {activeTab === 'AKTIF'
                    ? "Anda tidak memiliki iklan yang aktif"
                    : "Tidak ada iklan di sini"}
            </Text>
            <Text style={styles.emptySubtitle}>
                Mulai berjualan barang yang tidak terpakai dan hasilkan uang!
            </Text>
            <TouchableOpacity
                style={styles.sellButton}
                onPress={() => navigation.navigate('Jual')}
            >
                <Text style={styles.sellButtonText}>MULAI BERJUALAN</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Iklan Saya</Text>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {renderTab('AKTIF', 'AKTIF', 0)}
                {renderTab('NONAKTIF', 'NONAKTIF', 0)}
                {renderTab('DITOLAK', 'DITOLAK', 0)}
            </View>

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
