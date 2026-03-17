import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    BackHandler,
    ToastAndroid,
    Platform,
    FlatList,
    RefreshControl,
} from 'react-native';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SCREEN_WIDTH, getCategoryColumns, isTablet } from '../utils/responsive';
import normalize from 'react-native-normalize';

const width = SCREEN_WIDTH;

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface Subcategory {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
}

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingSub, setLoadingSub] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [homeSearch, setHomeSearch] = useState('');

    const currentBackPressTime = useRef<number>(0);
    const isFocused = useIsFocused();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (!isFocused) return false; // Let default back button behavior happen on other screens

                if (isModalVisible) {
                    setIsModalVisible(false);
                    return true; // Prevent default behavior
                }

                const timeNow = new Date().getTime();
                if (currentBackPressTime.current && timeNow - currentBackPressTime.current < 2000) {
                    BackHandler.exitApp();
                    return true;
                }

                currentBackPressTime.current = timeNow;
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Tekan sekali lagi untuk keluar', ToastAndroid.SHORT);
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [isModalVisible, isFocused])
    );

    useEffect(() => {
        navigation.setOptions({
            tabBarStyle: isModalVisible
                ? { display: 'none' }
                : { height: 70, paddingBottom: 10, paddingTop: 10 }
        });
    }, [isModalVisible, navigation]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://api.tokotitoh.co.id/categories', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
            });
            if (response.data && response.data.items && response.data.items.rows) {
                setCategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback data for demonstration if API fails or images are broken
            setCategories([
                { id: 1, name: 'MOBIL', icon: 'https://images.topgear.com.ph/topgear/images/2021/11/08/2022-suzuki-celerio-1636357416.jpg' },
                { id: 2, name: 'MOTOR', icon: 'http://localhost:8080/images/android-chrome-192x192.png' }, // Placeholder from API
                { id: 3, name: 'PROPERTI', icon: 'https://img.iproperty.com.my/ss-static/my/property/house-for-sale/h-1000x750.jpg' },
                { id: 4, name: 'ELEKTRONIK', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Vintage_Radio.jpg' },
                { id: 5, name: 'HP & GADGET', icon: 'https://m.media-amazon.com/images/I/71vw8Ic593L._AC_SL1500_.jpg' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async (category: Category) => {
        setSelectedCategory(category);
        setIsModalVisible(true);
        setLoadingSub(true);
        setSubcategories([]);

        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/subcategories?category_id=${category.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
            });
            if (response.data && response.data.items && response.data.items.rows) {
                setSubcategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoadingSub(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCategories();
        setRefreshing(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Container */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {/* <View style={styles.greenBox}>
                            <Icon name="happy-outline" size={24} color="#000" />
                        </View> */}
                        <Image source={require('../assets/images/tokotitoh.png')} style={{ width: 40, height: 40 }} />
                    </View>
                    <View style={styles.searchBar}>
                        <AppTextInput
                            placeholder="Cari disini"
                            maxFontSizeMultiplier={1.2}
                            style={styles.searchInput}
                            placeholderTextColor="#9E9E9E"
                            value={homeSearch}
                            onChangeText={setHomeSearch}
                            onSubmitEditing={() => {
                                navigation.navigate('AdsList', { search: homeSearch });
                                setHomeSearch(''); // Optional: clear after navigation
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.notificationBtn}
                        onPress={() => navigation.navigate('NotificationList')}
                    >
                        <Icon name="notifications-outline" size={28} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Category Grid */}
                <View style={styles.categoryContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#2196F3" />
                    ) : (
                        <View>
                            <FlatList
                                data={[...categories.slice(0, getCategoryColumns() - 1), { id: -1, name: 'Lihat Semua', icon: '' }]}
                                renderItem={({ item }) => (
                                    item.id === -1 ? (
                                        <TouchableOpacity onPress={() => navigation.navigate('Categories')} style={[styles.categoryItem, { width: (width - 32) / getCategoryColumns(), marginTop: normalize(10) }]}>
                                            <View style={styles.viewAllContainer}>
                                                <AppText style={styles.viewAllText}>LIHAT SEMUA</AppText>
                                                <AppText style={styles.viewAllText}>KATEGORI</AppText>
                                            </View>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.categoryItem, { width: (width - 32) / getCategoryColumns() }]}
                                            onPress={() => fetchSubcategories(item)}>
                                            <Image
                                                source={{
                                                    uri: item.icon.includes('localhost')
                                                        ? 'https://via.placeholder.com/150'
                                                        : item.icon,
                                                }}
                                                style={[styles.categoryImage, isTablet && { width: 100, height: 100 }]}
                                                resizeMode="contain"
                                            />
                                            <AppText style={styles.categoryText}>{item.name.toUpperCase()}</AppText>
                                        </TouchableOpacity>
                                    )
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={getCategoryColumns()}
                                scrollEnabled={false}
                            />
                            <FlatList
                                data={[...categories.slice(getCategoryColumns() - 1, getCategoryColumns() + 2)]}
                                renderItem={({ item }) => (
                                    (
                                        <TouchableOpacity
                                            style={[styles.categoryItem, { width: (width - 32) / getCategoryColumns() }]}
                                            onPress={() => fetchSubcategories(item)}>
                                            <Image
                                                source={{
                                                    uri: item.icon.includes('localhost')
                                                        ? 'https://via.placeholder.com/150'
                                                        : item.icon,
                                                }}
                                                style={[styles.categoryImage, isTablet && { width: 100, height: 100 }]}
                                                resizeMode="contain"
                                            />
                                            <AppText style={styles.categoryText}>{item.name.toUpperCase()}</AppText>
                                        </TouchableOpacity>
                                    )
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={getCategoryColumns()}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: normalize(-50) }}>
                    <Image source={require('../assets/images/indo_map.jpeg')} style={{ width: normalize(300), height: normalize(300) }} resizeMode="contain" />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10), marginTop: normalize(-50) }}>
                        <AppText style={{ fontSize: normalize(30), fontWeight: 'bold', color: '#000' }}>Halo,</AppText>
                        <AppText style={{ fontSize: normalize(30), fontWeight: 'bold', color: 'blue' }}>Selamat Datang!</AppText>
                    </View>
                    <AppText style={{ fontSize: normalize(24), color: '#000', textAlign: 'center', marginTop: normalize(10), fontWeight: 500 }}>Di Tokotitoh Tempatnya Jual Beli Online Seluruh Indonesia</AppText>
                </View>

                <View style={styles.contentPadding} />
            </ScrollView>

            {/* Subcategory Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setIsModalVisible(false)}>
                <SafeAreaView style={styles.modalSafeArea}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButtonModal}>
                            <IconFA name="chevron-left" size={20} color="#000" />
                        </TouchableOpacity>
                        <AppText style={styles.modalTitle}>
                            {selectedCategory ? selectedCategory.name : 'Subkategori'}
                        </AppText>
                    </View>

                    {loadingSub ? (
                        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={subcategories}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.subcategoryItem}
                                    onPress={() => {
                                        setIsModalVisible(false);
                                        navigation.navigate('AdsList', {
                                            category: selectedCategory,
                                            subcategory: item
                                        });
                                    }}>
                                    <AppText style={styles.subcategoryText}>{item.name}</AppText>
                                    {/* <Icon name="chevron-forward" size={20} color="#757575" /> */}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <AppText style={styles.emptyText}>Tidak ada subkategori ditemukan</AppText>
                            }
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </SafeAreaView>
            </Modal>
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
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    },
    logoContainer: {
        marginRight: 12,
    },
    greenBox: {
        width: 36,
        height: 36,
        backgroundColor: '#32CD32',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: normalize(16),
        color: '#000',
        padding: 0,
    },
    notificationBtn: {
        marginLeft: 12,
    },
    categoryContainer: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryItem: {
        alignItems: 'center',
        marginBottom: normalize(10),
    },
    categoryImage: {
        width: 80,
        height: 80,
        marginBottom: normalize(0),
    },
    categoryText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        // lineHeight: normalize(18),
    },
    viewAllContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#2152FF',
        textAlign: 'center',
    },
    contentPadding: {
        height: 100,
    },
    modalSafeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    backButtonModal: {
        padding: 5,
        marginRight: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    subcategoryItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    subcategoryText: {
        fontSize: 16,
        color: '#002F34',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#757575',
    },
});

export default HomeScreen;
