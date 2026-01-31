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
import { SCREEN_WIDTH } from '../utils/responsive';
import AdListItem from '../components/AdListItem';
import {
    navsCar,
    navsProperty,
    navsBusTruck,
    navsFoodPet,
    navsDefault,
} from '../utils/constants';

const width = SCREEN_WIDTH;

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
    const [activeFilterTab, setActiveFilterTab] = useState('MEREK');
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
        min_price: '',
        max_price: '',
        area: '',
        building: '',
    });

    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const [currentNavSet, setCurrentNavSet] = useState<any[]>(navsDefault);

    useEffect(() => {
        fetchAds(0, true);
        fetchProvinces();
        determineNavSet();
    }, []);

    const determineNavSet = () => {
        const catName = category?.name?.toLowerCase() || '';
        const subcatName = subcategory?.name?.toLowerCase() || '';

        if (catName.includes('mobil') || catName.includes('motor')) {
            setCurrentNavSet(navsCar);
            setActiveFilterTab('MEREK');
        } else if (catName.includes('properti')) {
            setCurrentNavSet(navsProperty);
            setActiveFilterTab('HARGA');
        } else if (subcatName.includes('alat berat') || subcatName.includes('bus dan truk')) {
            setCurrentNavSet(navsBusTruck);
            setActiveFilterTab('MEREK');
        } else if (catName.includes('makanan') || catName.includes('hewan')) {
            setCurrentNavSet(navsFoodPet);
            setActiveFilterTab('HARGA');
        } else {
            setCurrentNavSet(navsDefault);
            setActiveFilterTab('HARGA');
        }
    };

    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const response = await axios.get('https://api.tokotitoh.co.id/provinces', {
                headers: {
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                }
            });
            if (response.data && response.data.items) {
                setProvinces(response.data.items);
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchCities = async (provinceId: string) => {
        setLoadingCities(true);
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/cities?province_id=${provinceId}`, {
                headers: {
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                }
            });
            if (response.data && response.data.items) {
                setCities(response.data.items);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoadingCities(false);
        }
    };

    const brands = [
        { id: 'daihatsu', name: 'DAIHATSU', logo: 'https://www.carlogos.org/logo/Daihatsu-logo-800x450.png' },
        { id: 'honda', name: 'HONDA', logo: 'https://www.carlogos.org/logo/Honda-logo-1966-1024x768.png' },
        { id: 'hyundai', name: 'HYUNDAI', logo: 'https://www.carlogos.org/logo/Hyundai-logo-640x334.png' },
        { id: 'mercedes', name: 'Mercedes-Benz', logo: 'https://www.carlogos.org/logo/Mercedes-Benz-logo-2011-640x334.png' },
        { id: 'mitsubishi', name: 'MITSUBISHI', logo: 'https://www.carlogos.org/logo/Mitsubishi-logo-640x554.png' },
        { id: 'nissan', name: 'NISSAN', logo: 'https://www.carlogos.org/logo/Nissan-logo-2013-640x480.png' },
        { id: 'suzuki', name: 'SUZUKI', logo: 'https://www.carlogos.org/logo/Suzuki-logo-640x550.png' },
        { id: 'toyota', name: 'TOYOTA', logo: 'https://www.carlogos.org/logo/Toyota-logo-2005-640x480.png' },
        { id: 'wuling', name: 'WULING', logo: 'https://manuals.plus/wp-content/uploads/2022/10/WULING-Logo.png' },
    ];

    const otherBrands = [
        'ALFA ROMEO', 'ASTON MARTIN', 'AUDI', 'AUSTIN', 'BENTLEY', 'BIMANTARA', 'BMW', 'BYD', 'CADILLAC'
    ];

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
        <AdListItem item={item} />
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
                    <Text style={styles.locationTitle}>
                        {filters.city_id ? cities.find(c => c.id === filters.city_id)?.name :
                            filters.province_id ? provinces.find(p => p.id === filters.province_id)?.name :
                                'Lokasi'}
                    </Text>
                </View>
                <View style={styles.logoContainer}>
                    {/* <View style={styles.greenBox}>
                        <Icon name="happy-outline" size={20} color="#000" />
                    </View> */}
                    <Image
                        source={require('../assets/images/tokotitoh.png')}
                        style={styles.logo}
                    />
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
                    numColumns={1}
                    contentContainerStyle={styles.listContainer}
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
                    <View style={styles.newModalContent}>
                        {/* Custom Modal Header */}
                        <View style={styles.newModalHeader}>
                            <Text style={styles.newModalTitle}>
                                Filter: {category?.name || 'KATEGORI'} {'>'} {subcategory?.name || 'SUBKATEGORI'}
                            </Text>
                            <View style={styles.headerActionRow}>
                                <TouchableOpacity
                                    style={styles.resetHeaderBtn}
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
                                            min_price: '',
                                            max_price: '',
                                            area: '',
                                            building: '',
                                        });
                                    }}>
                                    <Text style={styles.resetHeaderText}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                    <Icon name="close-circle-outline" size={32} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalBodyContainer}>
                            {/* Sidebar */}
                            <View style={styles.sidebar}>
                                <TouchableOpacity
                                    style={[
                                        styles.sidebarTab,
                                        activeFilterTab === 'LOKASI' && styles.activeSidebarTab
                                    ]}
                                    onPress={() => setActiveFilterTab('LOKASI')}>
                                    <Text style={[
                                        styles.sidebarTabText,
                                        activeFilterTab === 'LOKASI' && styles.activeSidebarTabText
                                    ]}>LOKASI</Text>
                                </TouchableOpacity>
                                {currentNavSet.map((tab: any) => (
                                    <TouchableOpacity
                                        key={tab.name}
                                        style={[
                                            styles.sidebarTab,
                                            activeFilterTab === tab.name && styles.activeSidebarTab
                                        ]}
                                        onPress={() => setActiveFilterTab(tab.name)}>
                                        <Text style={[
                                            styles.sidebarTabText,
                                            activeFilterTab === tab.name && styles.activeSidebarTabText
                                        ]}>{tab.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Main Content */}
                            <ScrollView style={styles.filterContentScroll} showsVerticalScrollIndicator={true}>
                                {activeFilterTab === 'LOKASI' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Pilih Provinsi</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                            <View style={styles.chipContainer}>
                                                {provinces.map((p) => (
                                                    <TouchableOpacity
                                                        key={p.id}
                                                        style={[
                                                            styles.chip,
                                                            filters.province_id === p.id && styles.activeChip
                                                        ]}
                                                        onPress={() => {
                                                            setFilters({ ...filters, province_id: p.id, city_id: '' });
                                                            fetchCities(p.id);
                                                        }}>
                                                        <Text style={[
                                                            styles.chipText,
                                                            filters.province_id === p.id && styles.activeChipText
                                                        ]}>{p.name}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>

                                        {filters.province_id !== '' && (
                                            <>
                                                <Text style={[styles.newSectionLabel, { marginTop: 20 }]}>Pilih Kota</Text>
                                                <View style={styles.chipContainer}>
                                                    {cities.map((c) => (
                                                        <TouchableOpacity
                                                            key={c.id}
                                                            style={[
                                                                styles.chip,
                                                                filters.city_id === c.id && styles.activeChip
                                                            ]}
                                                            onPress={() => setFilters({ ...filters, city_id: c.id })}>
                                                            <Text style={[
                                                                styles.chipText,
                                                                filters.city_id === c.id && styles.activeChipText
                                                            ]}>{c.name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )}

                                {activeFilterTab === 'MEREK' && (
                                    <View style={styles.brandContainer}>
                                        <View style={styles.logoGrid}>
                                            {brands.map((brand) => (
                                                <TouchableOpacity
                                                    key={brand.id}
                                                    style={[
                                                        styles.logoItem,
                                                        filters.brand_id === brand.id && styles.activeLogoItem
                                                    ]}
                                                    onPress={() => setFilters({ ...filters, brand_id: brand.id })}>
                                                    <Image
                                                        source={{ uri: brand.logo }}
                                                        style={styles.brandLogo}
                                                        resizeMode="contain"
                                                    />
                                                    <Text style={styles.brandLogoName}>{brand.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <View style={styles.brandList}>
                                            {otherBrands.map((name) => (
                                                <TouchableOpacity
                                                    key={name}
                                                    style={styles.brandListItem}
                                                    onPress={() => setFilters({ ...filters, brand_id: name })}>
                                                    <Icon
                                                        name={filters.brand_id === name ? "checkbox" : "square-outline"}
                                                        size={24}
                                                        color={filters.brand_id === name ? "#2D5BD6" : "#000"}
                                                    />
                                                    <Text style={styles.brandListText}>{name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {activeFilterTab === 'HARGA' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Range Harga</Text>
                                        <TextInput
                                            style={styles.newFilterInput}
                                            placeholder="Harga Minimum"
                                            keyboardType="numeric"
                                            value={filters.min_price}
                                            onChangeText={(text) => setFilters({ ...filters, min_price: text })}
                                        />
                                        <View style={{ height: 10 }} />
                                        <TextInput
                                            style={styles.newFilterInput}
                                            placeholder="Harga Maksimum"
                                            keyboardType="numeric"
                                            value={filters.max_price}
                                            onChangeText={(text) => setFilters({ ...filters, max_price: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'LUAS TANAH' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Luas Tanah (m2)</Text>
                                        <TextInput
                                            style={styles.newFilterInput}
                                            placeholder="Gunakan angka saja"
                                            keyboardType="numeric"
                                            value={filters.area}
                                            onChangeText={(text) => setFilters({ ...filters, area: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'LUAS BANGUNAN' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Luas Bangunan (m2)</Text>
                                        <TextInput
                                            style={styles.newFilterInput}
                                            placeholder="Gunakan angka saja"
                                            keyboardType="numeric"
                                            value={filters.building}
                                            onChangeText={(text) => setFilters({ ...filters, building: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'TAHUN' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Tahun Kendaraan</Text>
                                        <TextInput
                                            style={styles.newFilterInput}
                                            placeholder="Contoh: 2020"
                                            keyboardType="numeric"
                                            value={filters.year}
                                            onChangeText={(text) => setFilters({ ...filters, year: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'TRANSMISI' && (
                                    <View style={styles.newFilterSection}>
                                        <Text style={styles.newSectionLabel}>Transmisi</Text>
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
                                )}

                                {activeFilterTab === 'URUTKAN' && (
                                    <View style={styles.brandList}>
                                        {['Terbaru', 'Harga Terendah', 'Harga Tertinggi', 'KM Terendah'].map((sort) => (
                                            <TouchableOpacity
                                                key={sort}
                                                style={styles.brandListItem}
                                                onPress={() => { }}>
                                                <Icon
                                                    name="radio-button-off"
                                                    size={24}
                                                    color="#000"
                                                />
                                                <Text style={styles.brandListText}>{sort}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {['MODEL', 'BAHAN BAKAR', 'KATEGORI'].includes(activeFilterTab) && (
                                    <View style={styles.placeholderTab}>
                                        <Text style={styles.placeholderTabText}>Filter {activeFilterTab} akan tersedia segera</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            style={styles.newApplyButton}
                            onPress={() => {
                                setIsFilterVisible(false);
                                setPage(0);
                                fetchAds(0, true);
                            }}>
                            <Text style={styles.newApplyButtonText}>Terapkan</Text>
                        </TouchableOpacity>
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
        paddingTop: 12,
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
    newModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '92%',
        paddingBottom: 20,
    },
    newModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    newModalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    headerActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resetHeaderBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
    },
    resetHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D5BD6',
    },
    modalBodyContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 100,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#F2F4F5',
    },
    sidebarTab: {
        paddingVertical: 15,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    activeSidebarTab: {
        backgroundColor: '#D1D5DB', // Light grey as per image
    },
    sidebarTabText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    activeSidebarTabText: {
        color: '#000',
    },
    filterContentScroll: {
        flex: 1,
        padding: 10,
    },
    brandContainer: {
        flex: 1,
    },
    logoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    logoItem: {
        width: '31%',
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        padding: 5,
    },
    activeLogoItem: {
        borderColor: '#2D5BD6',
        borderWidth: 2,
    },
    brandLogo: {
        width: '80%',
        height: '60%',
    },
    brandLogoName: {
        fontSize: 8,
        color: '#000',
        marginTop: 2,
        textAlign: 'center',
    },
    brandList: {
        marginTop: 10,
    },
    brandListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },
    brandListText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    placeholderTab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    placeholderTabText: {
        fontSize: 14,
        color: '#757575',
    },
    newApplyButton: {
        backgroundColor: '#2D5BD6',
        marginHorizontal: 16,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    newApplyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    newFilterSection: {
        marginBottom: 20,
    },
    newSectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002F34',
        marginBottom: 8,
    },
    newFilterInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 14,
        color: '#000',
    },
    chipScroll: {
        marginBottom: 10,
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
    logo: {
        width: 30,
        height: 30,
    },
});

export default AdsListScreen;
