import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import normalize from 'react-native-normalize';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - 48) / NUM_COLUMNS;

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

const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'bearer-token': 'tokotitohapi',
    'x-partner-code': 'id.marketplace.tokotitoh'
};

const CategoryListScreen = () => {
    const navigation = useNavigation<any>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Subcategory modal state
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
                headers: API_HEADERS,
            });
            if (response.data?.items?.rows) {
                setCategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            const response = await axios.get(
                `https://api.tokotitoh.co.id/subcategories?category_id=${category.id}`,
                { headers: API_HEADERS }
            );
            if (response.data?.items?.rows) {
                setSubcategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoadingSub(false);
        }
    };

    const handleSubcategoryPress = (subcategory: Subcategory) => {
        setIsModalVisible(false);
        navigation.navigate('AdsList', {
            category: selectedCategory,
            subcategory: subcategory
        });
    };

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => fetchSubcategories(item)}
            activeOpacity={0.7}
        >
            <Image
                source={{
                    uri: item.icon.includes('localhost')
                        ? 'https://via.placeholder.com/150'
                        : item.icon,
                }}
                style={styles.categoryImage}
                resizeMode="contain"
            />
            <AppText style={styles.categoryName} numberOfLines={2}>
                {item.name.toUpperCase()}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-back" size={24} color="#000" />
                    <AppText style={styles.backText}>Kembali</AppText>
                </TouchableOpacity>
            </View>

            {/* Title */}
            <AppText style={styles.title}>Kategori</AppText>

            {/* Category Grid */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="folder-open-outline" size={64} color="#E0E0E0" />
                            <AppText style={styles.emptyText}>Tidak ada kategori ditemukan</AppText>
                        </View>
                    }
                />
            )}

            {/* Subcategory Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
        paddingVertical: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    categoryItem: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        marginBottom: normalize(0),
    },
    categoryImage: {
        width: 80,
        height: 80,
        marginBottom: normalize(0),
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        lineHeight: normalize(10),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        marginTop: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        paddingHorizontal: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
        gap: 10,
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
    emptySubText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#757575',
    },
});

export default CategoryListScreen;
