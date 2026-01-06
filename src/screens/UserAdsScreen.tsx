import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SCREEN_WIDTH, getGridColumns } from '../utils/responsive';

const width = SCREEN_WIDTH;

interface AdItem {
    id: number;
    title: string;
    price: number;
    images: string;
    province_name: string;
    city_name: string;
    created_on: string;
    user_name: string;
}

const UserAdsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { userName, userId } = route.params || {};

    const [ads, setAds] = useState<AdItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchUserAds(0, true);
    }, []);

    const fetchUserAds = async (pageNumber: number, isInitial: boolean = false) => {
        if (!isInitial && (loadingMore || !hasMore)) return;

        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await axios.get('https://api.tokotitoh.co.id/ads', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
                params: {
                    pagination: 'true',
                    page: pageNumber,
                    size: PAGE_SIZE,
                    user_id: userId, // Filtering by user_name since API seems to support it or similar
                }
            });

            if (response.data && response.data.items && response.data.items.rows) {
                const newAds = response.data.items.rows;
                if (pageNumber === 0) {
                    setAds(newAds);
                } else {
                    setAds(prev => [...prev, ...newAds]);
                }

                if (newAds.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error('Error fetching user ads:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(0);
        setHasMore(true);
        fetchUserAds(0, true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUserAds(nextPage);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const renderAdItem = ({ item }: { item: AdItem }) => (
        <TouchableOpacity
            style={[styles.adCard, { width: (width - (16 * (getGridColumns() + 1))) / getGridColumns() }]}
            onPress={() => navigation.navigate('AdDetail', { adId: item.id })}>
            <Image
                source={{ uri: JSON.parse(item.images)[0] }}
                style={styles.adImage}
                resizeMode="cover"
            />
            <View style={styles.adContent}>
                <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
                <View style={styles.locationContainer}>
                    <Icon name="location-outline" size={12} color="#757575" />
                    <Text style={styles.locationText}>{item.city_name}, {item.province_name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{userName}</Text>
                    <Text style={styles.headerSubtitle}>Anggota Member</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={ads}
                    renderItem={renderAdItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={getGridColumns()}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={getGridColumns() > 1 ? styles.columnWrapper : null}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color="#002F34" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="alert-circle-outline" size={60} color="#E0E0E0" />
                            <Text style={styles.emptyText}>Tidak ada iklan ditemukan</Text>
                        </View>
                    }
                />
            )}
        </View>
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
        paddingHorizontal: 8,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#757575',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    adCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F2F4F5',
        overflow: 'hidden',
        marginBottom: 16,
    },
    adImage: {
        width: '100%',
        height: 150,
    },
    adContent: {
        padding: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
    },
    titleText: {
        fontSize: 14,
        color: '#002F34',
        marginVertical: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#757575',
        marginLeft: 4,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#757575',
    },
});

export default UserAdsScreen;
