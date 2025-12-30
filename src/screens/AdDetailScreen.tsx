import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Linking,
    FlatList,
    Modal,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AdDetail {
    id: number;
    title: string;
    price: number;
    description: string;
    user_name: string;
    images: string; // JSON string array
    brand_name: string;
    type_name: string;
    category_name: string;
    subcategory_name: string;
    province_name: string;
    city_name: string;
    district_name: string;
    km: number;
    transmission: string;
    fuel_type: string;
    year: string;
    color: string;
    ownership: string;
    condition: string;
    wa: string;
    created_on: string;
}

const AdDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { adId } = route.params;

    const [ad, setAd] = useState<AdDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageFullVisible, setIsImageFullVisible] = useState(false);
    const [fullImageIndex, setFullImageIndex] = useState(0);

    useEffect(() => {
        fetchAdDetail();
    }, []);

    const fetchAdDetail = async () => {
        try {
            const response = await axios.get(`https://api.tokotitoh.co.id/ads?id=${adId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
            });
            if (response.data && response.data.items && response.data.items.rows && response.data.items.rows.length > 0) {
                setAd(response.data.items.rows[0]);
            }
        } catch (error) {
            console.error('Error fetching ad detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleWhatsApp = () => {
        if (ad?.wa) {
            Linking.openURL(`whatsapp://send?phone=${ad.wa}&text=Halo, saya tertarik dengan iklan ${ad.title}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#002F34" />
            </View>
        );
    }

    if (!ad) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Iklan tidak ditemukan</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const adImages = ad.images ? JSON.parse(ad.images) : [];

    const SpecItem = ({ icon, label, value }: { icon: string, label: string, value: string | number }) => (
        <View style={styles.specItem}>
            <Icon name={icon} size={20} color="#757575" />
            <View style={styles.specTextContent}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value || '-'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Icon name="share-social-outline" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Icon name="heart-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <FlatList
                        data={adImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const offset = e.nativeEvent.contentOffset.x;
                            setActiveImageIndex(Math.round(offset / width));
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity activeOpacity={0.9} onPress={() => {
                                setFullImageIndex(index);
                                setIsImageFullVisible(true);
                            }}>
                                <Image source={{ uri: item }} style={styles.detailImage} resizeMode="cover" />
                            </TouchableOpacity>
                        )}
                    />
                    {adImages.length > 1 && (
                        <View style={styles.pagination}>
                            <Text style={styles.paginationText}>{activeImageIndex + 1}/{adImages.length}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                    <Text style={styles.price}>{formatPrice(ad.price)}</Text>
                    <Text style={styles.title}>{ad.title}</Text>
                    <View style={styles.locationRow}>
                        <Icon name="location-outline" size={14} color="#757575" />
                        <Text style={styles.locationText}>{ad.district_name}, {ad.city_name}</Text>
                        <Text style={styles.dateText}> • {new Date(ad.created_on).toLocaleDateString('id-ID')}</Text>
                    </View>
                </View>

                {/* Detail Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Detail</Text>
                </View>
                <View style={styles.specGrid}>
                    <SpecItem icon="calendar-outline" label="Tahun" value={ad.year} />
                    <SpecItem icon="speedometer-outline" label="KM" value={ad.km?.toLocaleString()} />
                    <SpecItem icon="cog-outline" label="Transmisi" value={ad.transmission} />
                    <SpecItem icon="flame-outline" label="Bahan Bakar" value={ad.fuel_type} />
                    <SpecItem icon="color-palette-outline" label="Warna" value={ad.color} />
                    <SpecItem icon="person-outline" label="Kepemilikan" value={ad.ownership} />
                </View>

                {/* Description Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                </View>
                <View style={styles.descriptionContent}>
                    <Text style={styles.descriptionText}>{ad.description}</Text>
                </View>

                {/* Seller Info */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Profil Penjual</Text>
                </View>
                <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                        <Icon name="person" size={30} color="#757575" />
                    </View>
                    <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{ad.user_name}</Text>
                        <Text style={styles.memberText}>Anggota Member</Text>
                    </View>
                    <TouchableOpacity style={styles.viewProfileBtn}>
                        <Icon name="chevron-forward" size={24} color="#757575" />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Full Screen Image Modal */}
            <Modal
                visible={isImageFullVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsImageFullVisible(false)}>
                <View style={styles.fullScreenOverlay}>
                    <StatusBar barStyle="light-content" backgroundColor="#000" />
                    <TouchableOpacity
                        style={styles.closeFullBtn}
                        onPress={() => setIsImageFullVisible(false)}>
                        <Icon name="close" size={32} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={adImages}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={fullImageIndex}
                        getItemLayout={(data, index) => (
                            { length: width, offset: width * index, index }
                        )}
                        onScroll={(e) => {
                            const offset = e.nativeEvent.contentOffset.x;
                            setFullImageIndex(Math.round(offset / width));
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.fullImageWrapper}>
                                <Image
                                    source={{ uri: item }}
                                    style={styles.fullImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    />

                    <View style={styles.fullPagination}>
                        <Text style={styles.fullPaginationText}>
                            {fullImageIndex + 1} / {adImages.length}
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.chatBtn}>
                    <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
                    <Icon name="logo-whatsapp" size={20} color="#fff" />
                    <Text style={styles.waBtnText}>WhatsApp</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: 12,
        paddingBottom: 8,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    headerRight: {
        flexDirection: 'row',
    },
    headerBtn: {
        padding: 8,
    },
    imageContainer: {
        width: width,
        height: 300,
        backgroundColor: '#F2F4F5',
    },
    detailImage: {
        width: width,
        height: 300,
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paginationText: {
        color: '#fff',
        fontSize: 12,
    },
    contentSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002F34',
    },
    title: {
        fontSize: 18,
        color: '#002F34',
        marginTop: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    locationText: {
        fontSize: 14,
        color: '#757575',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#757575',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    specGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    specItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    specTextContent: {
        marginLeft: 12,
    },
    specLabel: {
        fontSize: 12,
        color: '#757575',
    },
    specValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002F34',
    },
    descriptionContent: {
        paddingHorizontal: 16,
    },
    descriptionText: {
        fontSize: 15,
        color: '#404E50',
        lineHeight: 22,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    sellerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F2F4F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 16,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
    },
    memberText: {
        fontSize: 13,
        color: '#757575',
        marginTop: 2,
    },
    viewProfileBtn: {
        padding: 4,
    },
    bottomPadding: {
        height: 100,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F2F4F5',
        gap: 12,
    },
    chatBtn: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#002F34',
        borderRadius: 4,
    },
    chatBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#002F34',
    },
    waBtn: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#002F34',
        borderRadius: 4,
        gap: 8,
    },
    waBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#002F34',
        borderRadius: 4,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeFullBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 100,
        padding: 8,
    },
    fullImageWrapper: {
        width: width,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: width,
        height: '80%',
    },
    fullPagination: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fullPaginationText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdDetailScreen;
