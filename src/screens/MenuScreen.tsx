import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SCREEN_WIDTH, getCategoryColumns, isTablet } from '../utils/responsive';

const { width } = { width: SCREEN_WIDTH };

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

const MenuScreen = () => {
    const navigation = useNavigation<any>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingSub, setLoadingSub] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
            // Fallback data if API fails
            setCategories([
                { id: 1, name: 'MOBIL', icon: 'https://images.topgear.com.ph/topgear/images/2021/11/08/2022-suzuki-celerio-1636357416.jpg' },
                { id: 2, name: 'MOTOR', icon: 'https://via.placeholder.com/150' },
                { id: 3, name: 'PROPERTI', icon: 'https://img.iproperty.com.my/ss-static/my/property/house-for-sale/h-1000x750.jpg' },
                { id: 4, name: 'ELEKTRONIK', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Vintage_Radio.jpg' },
                { id: 5, name: 'HP & GADGET', icon: 'https://m.media-amazon.com/images/I/71vw8Ic593L._AC_SL1500_.jpg' },
                { id: 6, name: 'HOBI', icon: 'https://via.placeholder.com/150' },
                { id: 7, name: 'FASHION', icon: 'https://via.placeholder.com/150' },
                { id: 8, name: 'OLAHRAGA', icon: 'https://via.placeholder.com/150' },
                { id: 9, name: 'LAINNYA', icon: 'https://via.placeholder.com/150' },
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

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => fetchSubcategories(item)}
        >
            <View style={styles.iconWrapper}>
                <Image
                    source={{
                        uri: item.icon.includes('localhost')
                            ? 'https://via.placeholder.com/150'
                            : item.icon,
                    }}
                    style={styles.gridIcon}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.gridText} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kategori</Text>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={getCategoryColumns()}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Subcategory Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedCategory ? selectedCategory.name : 'Subkategori'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Icon name="close" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {loadingSub ? (
                            <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={subcategories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.subcategoryRow}
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            navigation.navigate('AdsList', {
                                                category: selectedCategory,
                                                subcategory: item
                                            });
                                        }}>
                                        <Text style={styles.subcategoryLabel}>{item.name}</Text>
                                        <Icon name="chevron-forward" size={20} color="#757575" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyLabel}>Tidak ada subkategori ditemukan</Text>
                                }
                                contentContainerStyle={{ paddingBottom: 40 }}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
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
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#002F34',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContent: {
        padding: 8,
    },
    gridItem: {
        width: (width - 16) / getCategoryColumns(),
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconWrapper: {
        width: isTablet ? 100 : 64,
        height: isTablet ? 100 : 64,
        backgroundColor: '#F7F8F9',
        borderRadius: isTablet ? 50 : 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridIcon: {
        width: isTablet ? 60 : 40,
        height: isTablet ? 60 : 40,
    },
    gridText: {
        fontSize: isTablet ? 14 : 12,
        fontWeight: '700',
        color: '#002F34',
        textAlign: 'center',
        paddingHorizontal: 4,
        textTransform: 'uppercase',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        paddingHorizontal: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#002F34',
    },
    subcategoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    subcategoryLabel: {
        fontSize: 16,
        color: '#002F34',
        fontWeight: '500',
    },
    emptyLabel: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#757575',
    },
});

export default MenuScreen;
