import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    Modal,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AdItem {
    id: number;
    title: string;
    price: number;
    images: string;
    province_name: string;
    city_name: string;
    created_on: string;
}

const AdsListScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { category, subcategory, search } = route.params || {};

    const [ads, setAds] = useState<AdItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 8;

    const [searchQuery, setSearchQuery] = useState(search || '');

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        brand_id: '',
        type_id: '',
        province_id: '',
        city_id: '',
        district_id: '',
        km: '',
        transmission: '',
        year: '',
        color: '',
        ownership: '',
        status: '',
    });

    useEffect(() => {
        fetchAds(0, true);
    }, []);

    const fetchAds = async (pageNumber: number, isInitial: boolean = false) => {
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
                    subcategory_id: subcategory?.id,
                    search: searchQuery,
                    ...filters
                }
            });

            if (response.data && response.data.items && response.data.items.rows) {
                const newAds = response.data.items.rows;
                if (pageNumber === 0) {
                    setAds(newAds);
                } else {
                    setAds(prev => [...prev, ...newAds]);
                }

                // If we got fewer items than requested, we've reached the end
                if (newAds.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(0);
        setHasMore(true);
        await fetchAds(0, true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAds(nextPage);
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
            style={styles.adCard}
            onPress={() => navigation.navigate('AdDetail', { adId: item.id })}>
            <Image
                source={{ uri: JSON.parse(item?.images)[0] }}
                defaultSource={{ uri: 'https://via.placeholder.com/150' }}
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
            {/* Header 1: Filter, Location, Logo */}
            <View style={styles.header1}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setIsFilterVisible(true)}>
                    <Icon name="filter-outline" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.locationInfo}>
                    <Icon name="location-outline" size={18} color="#002F34" />
                    <Text style={styles.locationTitle}>Jakarta Selatan</Text>
                </View>
                <View style={styles.logoContainer}>
                    <View style={styles.greenBox}>
                        <Icon name="happy-outline" size={20} color="#000" />
                    </View>
                </View>
            </View>

            {/* Header 2: Search Bar */}
            <View style={styles.header2}>
                <View style={styles.searchBar}>
                    <Icon name="search-outline" size={20} color="#757575" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Cari disini"
                        style={styles.searchInput}
                        placeholderTextColor="#9E9E9E"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => fetchAds(0, true)}
                    />
                </View>
            </View>

            {/* Header 3: Breadcrumb */}
            <View style={styles.header3}>
                <Text style={styles.breadcrumbText}>
                    {category?.name || 'Kategori'}  {'>'}  <Text style={styles.activeBreadcrumb}>{subcategory?.name || 'Subkategori'}</Text>
                </Text>
            </View>

            {/* Body: Ads List */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={ads}
                    renderItem={renderAdItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color="#002F34" />
                                <Text style={styles.footerText}>Memuat lebih banyak...</Text>
                            </View>
                        ) : (
                            <View style={{ height: 20 }} />
                        )
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Tidak ada iklan ditemukan</Text>
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal
                visible={isFilterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFilterVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                <Icon name="close" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterForm}>
                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Brand ID</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Brand ID"
                                    value={filters.brand_id}
                                    onChangeText={(text) => setFilters({ ...filters, brand_id: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Tahun</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Contoh: 2020"
                                    keyboardType="numeric"
                                    value={filters.year}
                                    onChangeText={(text) => setFilters({ ...filters, year: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Kilometer (KM)</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Contoh: 10000"
                                    keyboardType="numeric"
                                    value={filters.km}
                                    onChangeText={(text) => setFilters({ ...filters, km: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Type ID</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Type ID"
                                    value={filters.type_id}
                                    onChangeText={(text) => setFilters({ ...filters, type_id: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Provinsi ID</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Province ID"
                                    value={filters.province_id}
                                    onChangeText={(text) => setFilters({ ...filters, province_id: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Kota ID</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="City ID"
                                    value={filters.city_id}
                                    onChangeText={(text) => setFilters({ ...filters, city_id: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Kecamatan ID</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="District ID"
                                    value={filters.district_id}
                                    onChangeText={(text) => setFilters({ ...filters, district_id: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Transmisi</Text>
                                <View style={styles.chipContainer}>
                                    {['Manual', 'Automatic'].map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[
                                                styles.chip,
                                                filters.transmission === t && styles.activeChip
                                            ]}
                                            onPress={() => setFilters({ ...filters, transmission: t })}>
                                            <Text style={[
                                                styles.chipText,
                                                filters.transmission === t && styles.activeChipText
                                            ]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Warna</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Contoh: Merah"
                                    value={filters.color}
                                    onChangeText={(text) => setFilters({ ...filters, color: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Kepemilikan</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Contoh: Tangan Pertama"
                                    value={filters.ownership}
                                    onChangeText={(text) => setFilters({ ...filters, ownership: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionLabel}>Status</Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Status"
                                    value={filters.status}
                                    onChangeText={(text) => setFilters({ ...filters, status: text })}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setFilters({
                                        brand_id: '',
                                        type_id: '',
                                        province_id: '',
                                        city_id: '',
                                        district_id: '',
                                        km: '',
                                        transmission: '',
                                        year: '',
                                        color: '',
                                        ownership: '',
                                        status: '',
                                    });
                                }}>
                                <Text style={styles.clearButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => {
                                    setIsFilterVisible(false);
                                    setPage(0);
                                    fetchAds(0, true);
                                }}>
                                <Text style={styles.applyButtonText}>Terapkan</Text>
                            </TouchableOpacity>
                        </View>
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
    header1: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    backButton: {
        marginRight: 12,
    },
    filterButton: {
        marginRight: 12,
    },
    locationInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
        marginLeft: 4,
    },
    logoContainer: {
        marginLeft: 12,
    },
    greenBox: {
        width: 32,
        height: 32,
        backgroundColor: '#32CD32',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header2: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F4F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        padding: 0,
    },
    header3: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#757575',
    },
    activeBreadcrumb: {
        color: '#002F34',
        fontWeight: 'bold',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    adCard: {
        width: (width - 48) / 2,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F2F4F5',
        overflow: 'hidden',
    },
    adImage: {
        width: '100%',
        height: 120,
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    filterForm: {
        flex: 1,
        padding: 16,
    },
    filterSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002F34',
        marginBottom: 8,
    },
    filterInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 14,
        color: '#000',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F4F5',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
    },
    applyButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#002F34',
        borderRadius: 8,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
    },
    activeChip: {
        backgroundColor: '#002F34',
        borderColor: '#002F34',
    },
    chipText: {
        fontSize: 14,
        color: '#002F34',
    },
    activeChipText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#757575',
    },
});

export default AdsListScreen;
