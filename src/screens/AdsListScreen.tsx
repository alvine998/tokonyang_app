import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    Modal,
    ScrollView,
    Text,
} from 'react-native';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
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
import normalize from 'react-native-normalize';

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
    const [brands, setBrands] = useState([]);
    const fetchBrands = async () => {
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/brands?category_id=${subcategory?.category_id || category?.id}&page=1&size=999`, {
                headers: {
                    "bearer-token": "tokotitohapi",
                    "x-partner-code": "id.marketplace.tokotitoh",
                },
            });
            if (response.data && response.data.items) {
                setBrands(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const [activeFilterTab, setActiveFilterTab] = useState('MEREK');
    const [filters, setFilters] = useState({
        subcategory_id: subcategory?.id || '',
        status: '1',
        search: search || '',
        pagination: true,
        page: 0,
        size: 8,
        brand_id: [] as any[],
        type_id: [] as any[],
        province_id: '',
        city_id: '',
        district_id: '',
        transmission: '',
        min: '5',
        max: '1000000000000',
        minArea: '',
        maxArea: '',
        minBuilding: '',
        maxBuilding: '',
        sort: '',
        year_start: '',
        year_end: '',
        fuel_type: '',
        condition: '',
    });

    const createQueryString = (params: any) => {
        return Object.keys(params)
            .filter(key => {
                const val = params[key];
                return val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && val.length === 0);
            })
            .map(key => {
                const val = params[key];
                const valueToEncode = Array.isArray(val) ? val.join(',') : val;
                return `${encodeURIComponent(key)}=${encodeURIComponent(valueToEncode)}`;
            })
            .join('&');
    };

    const safeParseInt = (value: any, defaultValue: number) => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? defaultValue : parsed;
    };

    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    const [apiBrands, setApiBrands] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loadingFilterData, setLoadingFilterData] = useState(false);

    const [currentNavSet, setCurrentNavSet] = useState<any[]>(navsDefault);

    useEffect(() => {
        fetchAds(0, true);
        fetchFilterData();
        determineNavSet();
        fetchBrands();
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

    const fetchFilterData = async () => {
        setLoadingFilterData(true);
        try {
            const [brandsRes, provincesRes, categoriesRes] = await Promise.all([
                axios.get(`https://api.tokotitoh.co.id/brands?category_id=${subcategory?.category_id || category?.id}&page=1&size=999`, {
                    headers: {
                        "bearer-token": "tokotitohapi",
                        "x-partner-code": "id.marketplace.tokotitoh",
                    },
                }),
                axios.get(`https://api.tokotitoh.co.id/provinces?page=1&size=999`, {
                    headers: {
                        "bearer-token": "tokotitohapi",
                        "x-partner-code": "id.marketplace.tokotitoh",
                    },
                }),
                axios.get(`https://api.tokotitoh.co.id/categories?page=1&size=999`, {
                    headers: {
                        "bearer-token": "tokotitohapi",
                        "x-partner-code": "id.marketplace.tokotitoh",
                    },
                }),
            ]);

            if (brandsRes.data && brandsRes.data.items) {
                setApiBrands(brandsRes.data.items.rows);
            }
            if (provincesRes.data && provincesRes.data.items) {
                setProvinces(provincesRes.data.items.rows);
            }
            if (categoriesRes.data && categoriesRes.data.items) {
                setCategories(categoriesRes.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching filter data:', error);
        } finally {
            setLoadingFilterData(false);
        }
    };

    const fetchTypes = async (brandIds: any[]) => {
        if (brandIds.length === 0) {
            setTypes([]);
            return;
        }
        try {
            // Join brand IDs with comma as requested for the API
            const brandIdsQuery = brandIds.join(',');
            const response = await axios.get(`https://api.tokotitoh.co.id/types?brand_ids=${brandIdsQuery}&page=1&size=999`, {
                headers: {
                    "bearer-token": "tokotitohapi",
                    "x-partner-code": "id.marketplace.tokotitoh",
                },
            });
            if (response.data && response.data.items) {
                setTypes(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const toggleBrand = (brandId: any) => {
        setFilters(prev => {
            const newBrands = prev.brand_id.includes(brandId)
                ? prev.brand_id.filter(id => id !== brandId)
                : [...prev.brand_id, brandId];

            // Re-fetch types for all new brands
            fetchTypes(newBrands);

            // If brand is removed, we might want to clean up types that no longer belong to selected brands
            // but the API fetchTypes(newBrands) should handle it if it returns models for for all brands.
            // However, we should also clear type_id selections that are no longer valid if we want to be strict.
            // For now, let's just update brands.
            return { ...prev, brand_id: newBrands, type_id: [] }; // Reset types when brand changes for simplicity
        });
    };

    const toggleType = (typeId: any) => {
        setFilters(prev => {
            const newTypes = prev.type_id.includes(typeId)
                ? prev.type_id.filter(id => id !== typeId)
                : [...prev.type_id, typeId];
            return { ...prev, type_id: newTypes };
        });
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
                setCities(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoadingCities(false);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        setLoadingDistricts(true);
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/districts?city_id=${cityId}`, {
                headers: {
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                }
            });
            if (response.data && response.data.items) {
                setDistricts(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/subcategories?category_id=${categoryId}`, {
                headers: {
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                }
            });
            if (response.data && response.data.items) {
                setSubcategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    // const brands = [
    //     { id: 'daihatsu', name: 'DAIHATSU', logo: 'https://www.carlogos.org/logo/Daihatsu-logo-800x450.png' },
    //     { id: 'honda', name: 'HONDA', logo: 'https://www.carlogos.org/logo/Honda-logo-1966-1024x768.png' },
    //     { id: 'hyundai', name: 'HYUNDAI', logo: 'https://www.carlogos.org/logo/Hyundai-logo-640x334.png' },
    //     { id: 'mercedes', name: 'Mercedes-Benz', logo: 'https://www.carlogos.org/logo/Mercedes-Benz-logo-2011-640x334.png' },
    //     { id: 'mitsubishi', name: 'MITSUBISHI', logo: 'https://www.carlogos.org/logo/Mitsubishi-logo-640x554.png' },
    //     { id: 'nissan', name: 'NISSAN', logo: 'https://www.carlogos.org/logo/Nissan-logo-2013-640x480.png' },
    //     { id: 'suzuki', name: 'SUZUKI', logo: 'https://www.carlogos.org/logo/Suzuki-logo-640x550.png' },
    //     { id: 'toyota', name: 'TOYOTA', logo: 'https://www.carlogos.org/logo/Toyota-logo-2005-640x480.png' },
    //     { id: 'wuling', name: 'WULING', logo: 'https://manuals.plus/wp-content/uploads/2022/10/WULING-Logo.png' },
    // ];

    // const otherBrands = [
    //     'ALFA ROMEO', 'ASTON MARTIN', 'AUDI', 'AUSTIN', 'BENTLEY', 'BIMANTARA', 'BMW', 'BYD', 'CADILLAC'
    // ];

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
            const result = await axios.get(
                `https://api.tokotitoh.co.id/ads?${createQueryString({
                    ...filters,
                    subcategory_id: filters.subcategory_id === 0 ? "" : filters.subcategory_id,
                    page: pageNumber,
                    size: PAGE_SIZE,
                    search: searchQuery || filters.search
                })}`,
                {
                    headers: {
                        "bearer-token": "tokotitohapi",
                        "x-partner-code": "id.marketplace.tokotitoh",
                    },
                }
            );

            if (result.data && result.data.items && result.data.items.rows) {
                const newAds = result.data.items.rows;
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
                <TouchableOpacity onPress={() => setIsLocationModalVisible(true)} style={styles.locationInfo}>
                    <Icon name="location-outline" size={18} color="#002F34" />
                    <AppText style={styles.locationTitle}>
                        {filters.city_id ? (cities.find(c => c.id === filters.city_id)?.name?.includes('KABUPATEN') ? cities.find(c => c.id === filters.city_id)?.name?.replace('KABUPATEN', 'KAB. ') : cities.find(c => c.id === filters.city_id)?.name) :
                            filters.province_id ? provinces.find(p => p.id === filters.province_id)?.name :
                                'Lokasi'}
                    </AppText>
                </TouchableOpacity>
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
                    <AppTextInput
                        placeholder="Cari disini"
                        style={styles.searchInput}
                        placeholderTextColor="#9E9E9E"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => fetchAds(0, true)}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: '#F2F4F5', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' }]}
                    onPress={() => setIsFilterVisible(true)}>
                    <Text>Filter</Text>
                </TouchableOpacity>
            </View>

            {/* Header 3: Breadcrumb */}
            <View style={styles.header3}>
                <AppText style={styles.breadcrumbText}>
                    {category?.name || 'Kategori'}  {'>'}  <AppText style={styles.activeBreadcrumb}>{subcategory?.name || 'Subkategori'}</AppText>
                </AppText>
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
                                <AppText style={styles.footerText}>Memuat lebih banyak...</AppText>
                            </View>
                        ) : (
                            <View style={{ height: 20 }} />
                        )
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyText}>Tidak ada iklan ditemukan</AppText>
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
                            <AppText style={styles.newModalTitle}>
                                Filter: {category?.name || 'KATEGORI'} {'>'} {subcategory?.name || 'SUBKATEGORI'}
                            </AppText>
                            <View style={styles.headerActionRow}>
                                <TouchableOpacity
                                    style={styles.resetHeaderBtn}
                                    onPress={() => {
                                        setFilters({
                                            subcategory_id: subcategory?.id || '',
                                            status: '1',
                                            search: search || '',
                                            pagination: true,
                                            page: 0,
                                            size: 8,
                                            brand_id: [],
                                            type_id: [],
                                            province_id: '',
                                            city_id: '',
                                            district_id: '',
                                            transmission: '',
                                            min: '5',
                                            max: '1000000000000',
                                            minArea: '',
                                            maxArea: '',
                                            minBuilding: '',
                                            maxBuilding: '',
                                            sort: '',
                                            year_start: '',
                                            year_end: '',
                                            fuel_type: '',
                                            condition: '',
                                        });
                                        setCities([]);
                                        setDistricts([]);
                                        setTypes([]);
                                    }}>
                                    <AppText style={styles.resetHeaderText}>Reset</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                    <Icon name="close-circle-outline" size={32} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalBodyContainer}>
                            {/* Sidebar */}
                            <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
                                {currentNavSet.map((tab: any) => (
                                    <TouchableOpacity
                                        key={tab.name}
                                        style={[
                                            styles.sidebarTab,
                                            activeFilterTab === tab.name && styles.activeSidebarTab
                                        ]}
                                        onPress={() => setActiveFilterTab(tab.name)}>
                                        <AppText style={[
                                            styles.sidebarTabText,
                                            activeFilterTab === tab.name && styles.activeSidebarTabText
                                        ]}>{tab.name}</AppText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Main Content */}
                            <ScrollView style={styles.filterContentScroll} showsVerticalScrollIndicator={true}>
                                {activeFilterTab === 'MEREK' && (
                                    <View style={styles.brandContainer}>
                                        <View style={styles.logoGrid}>
                                            {(apiBrands.length > 0 ? apiBrands.filter((brand) => brand.image !== null).slice(0, 9) : brands).map((brand) => (
                                                <TouchableOpacity
                                                    key={brand.id}
                                                    style={[
                                                        styles.logoItem,
                                                        filters.brand_id.includes(brand.id) && styles.activeLogoItem
                                                    ]}
                                                    onPress={() => toggleBrand(brand.id)}>
                                                    <Image
                                                        source={{ uri: brand.image }}
                                                        style={styles.brandLogo}
                                                        resizeMode="contain"
                                                    />
                                                    {/* <AppText style={styles.brandLogoName}>{brand.name}</AppText> */}
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <View style={styles.brandList}>
                                            {(apiBrands.length > 9 ? apiBrands.slice(9) : brands).map((brandOrName: any) => {
                                                const brandName = typeof brandOrName === 'string' ? brandOrName : brandOrName.name;
                                                const brandId = typeof brandOrName === 'string' ? brandOrName : brandOrName.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={brandId}
                                                        style={styles.brandListItem}
                                                        onPress={() => toggleBrand(brandId)}>
                                                        <Icon
                                                            name={filters.brand_id.includes(brandId) ? "checkbox" : "square-outline"}
                                                            size={24}
                                                            color={filters.brand_id.includes(brandId) ? "#2D5BD6" : "#000"}
                                                        />
                                                        <AppText style={styles.brandListText}>{brandName}</AppText>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {activeFilterTab === 'MODEL' && (
                                    <View style={styles.brandList}>
                                        {types.length > 0 ? (
                                            types.map((type) => (
                                                <TouchableOpacity
                                                    key={type.id}
                                                    style={styles.brandListItem}
                                                    onPress={() => toggleType(type.id)}>
                                                    <Icon
                                                        name={filters.type_id.includes(type.id) ? "checkbox" : "square-outline"}
                                                        size={24}
                                                        color={filters.type_id.includes(type.id) ? "#2D5BD6" : "#000"}
                                                    />
                                                    <AppText style={styles.brandListText}>{type.name}</AppText>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <View style={styles.placeholderTab}>
                                                <AppText style={styles.placeholderTabText}>Pilih Merek terlebih dahulu</AppText>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {activeFilterTab === 'HARGA' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Range Harga</AppText>
                                        <AppTextInput
                                            style={styles.newFilterInput}
                                            placeholder="Harga Minimum"
                                            keyboardType="numeric"
                                            value={filters.min}
                                            onChangeText={(text) => setFilters({ ...filters, min: text })}
                                        />
                                        <View style={{ height: 10 }} />
                                        <AppTextInput
                                            style={styles.newFilterInput}
                                            placeholder="Harga Maksimum"
                                            keyboardType="numeric"
                                            value={filters.max}
                                            onChangeText={(text) => setFilters({ ...filters, max: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'LUAS TANAH' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Luas Tanah (m2)</AppText>
                                        <AppTextInput
                                            style={styles.newFilterInput}
                                            placeholder="Gunakan angka saja"
                                            keyboardType="numeric"
                                            value={filters.minArea}
                                            onChangeText={(text) => setFilters({ ...filters, minArea: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'LUAS BANGUNAN' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Luas Bangunan (m2)</AppText>
                                        <AppTextInput
                                            style={styles.newFilterInput}
                                            placeholder="Gunakan angka saja"
                                            keyboardType="numeric"
                                            value={filters.minBuilding}
                                            onChangeText={(text) => setFilters({ ...filters, minBuilding: text })}
                                        />
                                    </View>
                                )}

                                {activeFilterTab === 'TAHUN' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Tahun Kendaraan</AppText>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <AppTextInput
                                                style={[styles.newFilterInput, { flex: 1, textAlign: 'center' }]}
                                                placeholder="1945"
                                                keyboardType="numeric"
                                                maxLength={4}
                                                value={filters.year_start}
                                                onChangeText={(text) => setFilters({ ...filters, year_start: text })}
                                            />
                                            <AppText style={{ marginHorizontal: 10 }}>-</AppText>
                                            <AppTextInput
                                                style={[styles.newFilterInput, { flex: 1, textAlign: 'center' }]}
                                                placeholder={`${new Date().getFullYear()}`}
                                                keyboardType="numeric"
                                                maxLength={4}
                                                value={filters.year_end}
                                                onChangeText={(text) => setFilters({ ...filters, year_end: text })}
                                            />
                                        </View>
                                    </View>
                                )}

                                {activeFilterTab === 'TRANSMISI' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Transmisi</AppText>
                                        <View style={styles.brandList}>
                                            {[
                                                { value: "", label: "Semua Transmisi" },
                                                { value: "MT", label: "Manual" },
                                                { value: "AT", label: "Automatic" },
                                                // { value: "CVT", label: "CVT" },
                                            ].map((opt) => (
                                                <TouchableOpacity
                                                    key={opt.value}
                                                    style={styles.brandListItem}
                                                    onPress={() => setFilters({ ...filters, transmission: opt.value })}>
                                                    <Icon
                                                        name={filters.transmission === opt.value ? "radio-button-on" : "radio-button-off"}
                                                        size={24}
                                                        color={filters.transmission === opt.value ? "#2D5BD6" : "#000"}
                                                    />
                                                    <AppText style={styles.brandListText}>{opt.label}</AppText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {activeFilterTab === 'KONDISI' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Kondisi</AppText>
                                        <View style={styles.brandList}>
                                            {[
                                                { value: "", label: "Semua Kondisi" },
                                                { value: "new", label: "Baru" },
                                                { value: "second", label: "Bekas" },
                                            ].map((opt) => (
                                                <TouchableOpacity
                                                    key={opt.value}
                                                    style={styles.brandListItem}
                                                    onPress={() => setFilters({ ...filters, condition: opt.value })}>
                                                    <Icon
                                                        name={filters.condition === opt.value ? "radio-button-on" : "radio-button-off"}
                                                        size={24}
                                                        color={filters.condition === opt.value ? "#2D5BD6" : "#000"}
                                                    />
                                                    <AppText style={styles.brandListText}>{opt.label}</AppText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {activeFilterTab === 'URUTKAN' && (
                                    <View style={styles.brandList}>
                                        {[
                                            { label: 'Iklan Terbaru', value: 'newest' },
                                            { label: 'Iklan Paling Murah', value: 'minprice' },
                                            { label: 'Iklan Paling Mahal', value: 'maxprice' }
                                        ].map((sortItem) => (
                                            <TouchableOpacity
                                                key={sortItem.value}
                                                style={styles.brandListItem}
                                                onPress={() => setFilters({ ...filters, sort: sortItem.value })}>
                                                <Icon
                                                    name={filters.sort === sortItem.value ? "radio-button-on" : "radio-button-off"}
                                                    size={24}
                                                    color={filters.sort === sortItem.value ? "#2D5BD6" : "#000"}
                                                />
                                                <AppText style={styles.brandListText}>{sortItem.label}</AppText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {activeFilterTab === 'BAHAN BAKAR' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Pilih Bahan Bakar</AppText>
                                        <View style={styles.brandList}>
                                            {[
                                                { value: "", label: "Semua Bahan Bakar" },
                                                { value: "bensin", label: "Bensin" },
                                                { value: "diesel", label: "Solar" },
                                                { value: "hybrid", label: "Hybrid" },
                                                { value: "ev", label: "Listrik" },
                                            ].map((opt) => (
                                                <TouchableOpacity
                                                    key={opt.value}
                                                    style={styles.brandListItem}
                                                    onPress={() => setFilters({ ...filters, fuel_type: opt.value })}>
                                                    <Icon
                                                        name={filters.fuel_type === opt.value ? "radio-button-on" : "radio-button-off"}
                                                        size={24}
                                                        color={filters.fuel_type === opt.value ? "#2D5BD6" : "#000"}
                                                    />
                                                    <AppText style={styles.brandListText}>{opt.label}</AppText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* {activeFilterTab === 'KATEGORI' && (
                                    <View style={styles.newFilterSection}>
                                        <AppText style={styles.newSectionLabel}>Pilih Kategori</AppText>
                                        <View style={styles.chipContainer}>
                                            {categories.map((c) => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[
                                                        styles.chip,
                                                        // Check if the current filter subcategory belongs to this category (simplified check)
                                                        // Ideally we should have category_id in filters or check fetching logic
                                                        // For now let's just highlight if we select it to fetch subcategories
                                                    ]}
                                                    onPress={() => {
                                                        setSubcategories([]);
                                                        fetchSubcategories(c.id);
                                                    }}>
                                                    <AppText style={styles.chipText}>{c.name}</AppText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {subcategories.length > 0 && (
                                            <>
                                                <AppText style={[styles.newSectionLabel, { marginTop: 20 }]}>Pilih Subkategori</AppText>
                                                <View style={styles.chipContainer}>
                                                    {subcategories.map((sc) => (
                                                        <TouchableOpacity
                                                            key={sc.id}
                                                            style={[
                                                                styles.chip,
                                                                filters.subcategory_id === sc.id && styles.activeChip
                                                            ]}
                                                            onPress={() => setFilters({ ...filters, subcategory_id: sc.id })}>
                                                            <AppText style={[
                                                                styles.chipText,
                                                                filters.subcategory_id === sc.id && styles.activeChipText
                                                            ]}>{sc.name}</AppText>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )} */}

                                {/* {['MODEL', 'BAHAN BAKAR', 'KATEGORI'].includes(activeFilterTab) && (
                                    <View style={styles.placeholderTab}>
                                        <AppText style={styles.placeholderTabText}>Filter {activeFilterTab} akan tersedia segera</AppText>
                                    </View>
                                )} */}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            style={styles.newApplyButton}
                            onPress={() => {
                                setIsFilterVisible(false);
                                setPage(0);
                                fetchAds(0, true);
                            }}>
                            <AppText style={styles.newApplyButtonText}>Terapkan</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Location Modal */}
            <Modal
                visible={isLocationModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsLocationModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.newModalContent}>
                        <View style={styles.newModalHeader}>
                            <AppText style={styles.newModalTitle}>Pilih Lokasi</AppText>
                            <View style={styles.headerActionRow}>
                                <TouchableOpacity
                                    style={styles.resetHeaderBtn}
                                    onPress={() => {
                                        setFilters({ ...filters, province_id: '', city_id: '', district_id: '' });
                                        setCities([]);
                                        setDistricts([]);
                                    }}>
                                    <AppText style={styles.resetHeaderText}>Reset</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                                    <Icon name="close-circle-outline" size={32} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={styles.newFilterContentScroll}>
                            <View style={styles.newFilterSection}>
                                <AppText style={styles.newSectionLabel}>Pilih Provinsi</AppText>
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
                                                    setFilters({ ...filters, province_id: p.id, city_id: '', district_id: '' });
                                                    setCities([]);
                                                    setDistricts([]);
                                                    fetchCities(p.id);
                                                }}>
                                                <AppText style={[
                                                    styles.chipText,
                                                    filters.province_id === p.id && styles.activeChipText
                                                ]}>{p.name}</AppText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {filters.province_id !== '' && (
                                    <>
                                        <AppText style={[styles.newSectionLabel, { marginTop: 20 }]}>Pilih Kota</AppText>
                                        <View style={styles.chipContainer}>
                                            {cities.map((c) => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[
                                                        styles.chip,
                                                        filters.city_id === c.id && styles.activeChip
                                                    ]}
                                                    onPress={() => {
                                                        setFilters({ ...filters, city_id: c.id, district_id: '' });
                                                        setDistricts([]);
                                                        fetchDistricts(c.id);
                                                    }}>
                                                    <AppText style={[
                                                        styles.chipText,
                                                        filters.city_id === c.id && styles.activeChipText
                                                    ]}>{c.name}</AppText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {filters.city_id !== '' && (
                                            <>
                                                <AppText style={[styles.newSectionLabel, { marginTop: 20 }]}>Pilih Kecamatan</AppText>
                                                <View style={styles.chipContainer}>
                                                    {districts.map((d) => (
                                                        <TouchableOpacity
                                                            key={d.id}
                                                            style={[
                                                                styles.chip,
                                                                filters.district_id === d.id && styles.activeChip
                                                            ]}
                                                            onPress={() => setFilters({ ...filters, district_id: d.id })}>
                                                            <AppText style={[
                                                                styles.chipText,
                                                                filters.district_id === d.id && styles.activeChipText
                                                            ]}>{d.name}</AppText>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.newApplyButton}
                            onPress={() => {
                                setIsLocationModalVisible(false);
                                fetchAds(0, true);
                            }}>
                            <AppText style={styles.newApplyButtonText}>Terapkan Lokasi</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
        </View >
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchBar: {
        flex: 1,
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
        width: '100%',
        height: '100%',
    },
    newModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '92%',
        width: '100%',
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
        width: normalize(20),
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
        fontSize: normalize(16),
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
        width: normalize(200),
    },
    newFilterContentScroll: {
        flex: 1,
        padding: 10,
        width: '100%'
    },
    brandContainer: {
        flex: 1,
    },
    logoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 0,
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
        marginTop: 0,
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
