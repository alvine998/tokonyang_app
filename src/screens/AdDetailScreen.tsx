import React, { useEffect, useState } from 'react';
import {
    View,
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
    Share,
    Alert,
    Platform,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface AdDetail {
    user_id: number;
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
    area?: number;
    building?: number;
    status: number | string;
}

const AdDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { user, updateUser } = useAuth();
    const { adId } = route.params;

    const [ad, setAd] = useState<AdDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageFullVisible, setIsImageFullVisible] = useState(false);
    const [fullImageIndex, setFullImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportForm, setReportForm] = useState({
        title: '',
        description: '',
        type: 'Penipuan',
    });
    const [isReporting, setIsReporting] = useState(false);
    const [reportImages, setReportImages] = useState<string[]>([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        fetchAdDetail();
    }, []);

    useEffect(() => {
        if (user && user.save_ads) {
            try {
                const savedAds = JSON.parse(user.save_ads);
                if (Array.isArray(savedAds)) {
                    setIsSaved(savedAds.includes(String(adId)));
                }
            } catch (e) {
                console.error('Error parsing save_ads:', e);
            }
        } else {
            setIsSaved(false);
        }
    }, [user, adId]);

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

    const handleShare = async () => {
        try {
            const subcategory = encodeURIComponent(ad?.subcategory_name?.toLowerCase().replace(/\s+/g, '-') || 'ads');
            const shareUrl = `https://tokotitoh.co.id/category/${subcategory}/${ad?.id}`;
            await Share.share({
                message: `Cek iklan ini: ${ad?.title} - ${shareUrl}`,
            });
        } catch (error) {
            console.error('Error sharing ad:', error);
        }
    };

    const handleSave = async () => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }

        const currentSavedAdsStr = user.save_ads || '[]';
        let savedAds: string[] = [];
        try {
            let parsed = JSON.parse(currentSavedAdsStr);
            if (typeof parsed === 'string' && parsed.startsWith('[')) {
                try { parsed = JSON.parse(parsed); } catch (e) { }
            }
            if (Array.isArray(parsed)) {
                savedAds = parsed.map(String);
            }
        } catch (e) {
            savedAds = [];
        }

        const adIdStr = String(adId);
        const alreadySaved = savedAds.includes(adIdStr);

        let newSavedAds: string[];
        if (alreadySaved) {
            newSavedAds = savedAds.filter(id => id !== adIdStr);
        } else {
            newSavedAds = [...savedAds, adIdStr];
        }

        const newSavedAdsStr = JSON.stringify(newSavedAds);

        try {
            const response = await axios.patch('https://api.tokotitoh.co.id/user', {
                id: user.id,
                save_ads: newSavedAdsStr
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                }
            });

            if (response.status === 200 || response.status === 201) {
                await updateUser({ save_ads: newSavedAdsStr });
                setIsSaved(!alreadySaved);
                Alert.alert('Sukses', alreadySaved ? 'Iklan dihapus dari favorit' : 'Iklan disimpan ke favorit');
            }
        } catch (error) {
            console.error('Error saving ad:', error);
            Alert.alert('Error', 'Gagal menyimpan iklan');
        }
    };

    const handleEdit = () => {
        if (!ad) return;
        navigation.navigate('Main', {
            screen: 'Jual',
            params: {
                editId: ad.id,
                adData: ad
            }
        });
    };

    const handleDelete = () => {
        if (!ad) return;

        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus iklan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await axios.delete(`https://api.tokotitoh.co.id/ads?id=${ad.id}`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'bearer-token': 'tokotitohapi',
                                    'x-partner-code': 'id.marketplace.tokotitoh'
                                },
                            });

                            if (response.status === 200 || response.status === 204) {
                                Alert.alert('Sukses', 'Iklan berhasil dihapus');
                                navigation.goBack();
                            } else {
                                throw new Error('Gagal menghapus iklan');
                            }
                        } catch (error) {
                            console.error('Error deleting ad:', error);
                            Alert.alert('Error', 'Gagal menghapus iklan');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const uploadImageToApi = async (uri: string) => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('file', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            const response = await fetch('https://api.tokotitoh.co.id/file-upload', {
                method: 'POST',
                headers: {
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh',
                },
                body: formData,
            });

            if (!response.ok) {
                console.error('Upload response not ok:', response.status);
                return null;
            }

            const result = await response.json();
            if (result.status === 'success' && result.url) {
                return result.url;
            }

            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleAddReportImage = async () => {
        if (reportImages.length >= 5) {
            Alert.alert('Peringatan', 'Maksimal 5 gambar yang diperbolehkan.');
            return;
        }

        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 5 - reportImages.length,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets.length > 0) {
                const selectedUris = result.assets
                    .map((asset: Asset) => asset.uri || '')
                    .filter((uri: string) => uri !== '');
                setReportImages([...reportImages, ...selectedUris]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal memilih gambar');
        }
    };

    const handleRemoveReportImage = (index: number) => {
        setReportImages(reportImages.filter((_, i) => i !== index));
    };

    const handleReport = async () => {
        if (!reportForm.title || !reportForm.description) {
            Alert.alert('Error', 'Harap isi semua bidang');
            return;
        }

        setIsReporting(true);
        try {
            // Upload images if any
            let uploadedImageUrls: string[] = [];
            if (reportImages.length > 0) {
                setIsUploadingImage(true);
                const uploadPromises = reportImages.map(uri => uploadImageToApi(uri));
                const results = await Promise.all(uploadPromises);
                uploadedImageUrls = results.filter((url): url is string => url !== null);
                setIsUploadingImage(false);
            }

            const payload = {
                title: `${reportForm.type} - ${reportForm.title}`,
                partner_code: 'id.marketplace.tokotitoh',
                description: reportForm.description,
                type: reportForm.type,
                ads_id: String(ad?.id),
                ads_name: ad?.title,
                user_id: String(user?.id) || 0,
                user_name: user?.name || 'Guest',
                images: uploadedImageUrls,
            };

            await axios.post('https://api.tokotitoh.co.id/report', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
            });

            setIsReportModalVisible(false);
            setReportForm({ title: '', description: '', type: 'Penipuan' });
            setReportImages([]);
            Alert.alert('Sukses', 'Berhasil melaporkan iklan ini');
        } catch (error) {
            console.error('Error reporting ad:', error);
            Alert.alert('Error', 'Gagal melaporkan iklan ini, harap hubungi admin');
        } finally {
            setIsReporting(false);
            setIsUploadingImage(false);
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
                <AppText style={styles.errorText}>Iklan tidak ditemukan</AppText>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AppText style={styles.backButtonText}>Kembali</AppText>
                </TouchableOpacity>
            </View>
        );
    }

    const adImages = ad.images ? JSON.parse(ad.images) : [];

    const SpecItem = ({ icon, label, value }: { icon: string, label: string, value: string | number }) => (
        <View style={styles.specItem}>
            <Icon name={icon} size={20} color="#757575" />
            <View style={styles.specTextContent}>
                <AppText style={styles.specLabel}>{label}</AppText>
                <AppText style={styles.specValue}>{value || '-'}</AppText>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        {Number(ad.status) === 1 && (
                            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                                <Icon name="share-social-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                        {Number(ad.status) === 1 && user?.id !== ad.user_id && (
                            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsReportModalVisible(true)}>
                                <Icon name="flag-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                        {Number(ad.status) === 1 && (
                            <TouchableOpacity
                                style={[styles.headerBtn]}
                                onPress={handleSave}
                            >
                                <Icon name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? "#000" : "#000"} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

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
                            <AppText style={styles.paginationText}>{activeImageIndex + 1}/{adImages.length}</AppText>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                    <AppText style={styles.price}>{formatPrice(ad.price)}</AppText>
                    <AppText style={styles.title}>{ad.title}</AppText>
                    <View style={styles.locationRow}>
                        <Icon name="location-outline" size={14} color="#757575" />
                        <AppText style={styles.locationText}>{ad.district_name}, {ad.city_name?.includes("KABUPATEN") ? ad.city_name?.replace("KABUPATEN", "KAB. ") : ad.city_name}</AppText>
                        <AppText style={styles.dateText}> • {new Date(ad.created_on).toLocaleDateString('id-ID')}</AppText>
                    </View>
                </View>

                {/* Detail Section */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Detail</AppText>
                </View>

                {/* Categories Logic from Web */}
                <View style={styles.specGrid}>
                    {/* Heavy Machinery & Trucks Case */}
                    {(ad.subcategory_name?.toLowerCase().includes("alat berat") ||
                        ad.subcategory_name?.toLowerCase().includes("bus dan truk")) && (
                            <SpecItem icon="calendar-outline" label="Tahun" value={ad.year} />
                        )}

                    {/* Mobil & Motor Case */}
                    {((ad.category_name?.toLowerCase().includes("mobil") && ad.subcategory_name?.toLowerCase().includes("dijual")) ||
                        (ad.category_name?.toLowerCase().includes("motor") && ad.subcategory_name?.toLowerCase().includes("dijual"))) && (
                            <>
                                <SpecItem icon="pricetag-outline" label="Merek" value={ad.brand_name} />
                                <SpecItem icon="options-outline" label="Tipe" value={ad.type_name} />
                                <SpecItem icon="calendar-outline" label="Tahun" value={ad.year} />
                                <SpecItem icon="cog-outline" label="Transmisi" value={ad.transmission} />
                                <SpecItem icon="flame-outline" label="Bahan Bakar" value={ad.fuel_type} />
                            </>
                        )}

                    {/* Properti Case */}
                    {ad.category_name?.toLowerCase().includes("properti") && (
                        <>
                            <SpecItem icon="expand-outline" label="Luas Tanah" value={`${ad.area || 0} m2`} />
                            <SpecItem icon="business-outline" label="Luas Bangunan" value={`${ad.building || 0} m2`} />
                        </>
                    )}

                    {/* General Specs */}
                    <SpecItem icon="location-outline" label="Kota" value={ad.district_name} />
                    <SpecItem icon="business-outline" label="Kab/Kota" value={ad.city_name?.includes("KABUPATEN") ? ad.city_name?.replace("KABUPATEN", "KAB. ") : ad.city_name} />
                    <SpecItem icon="checkmark-circle-outline" label="Kondisi" value={ad.condition} />
                </View>

                {/* Additional Action Buttons */}
                <View style={styles.actionRow}>
                    {Number(ad.status) === 1 && (
                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                            <Icon name="share-social-outline" size={18} color="#000" />
                            <AppText style={styles.actionBtnText}>Bagikan</AppText>
                        </TouchableOpacity>
                    )}
                    {Number(ad.status) === 1 && user?.id !== ad.user_id && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsReportModalVisible(true)}>
                            <Icon name="flag-outline" size={18} color="#000" />
                            <AppText style={styles.actionBtnText}>Laporkan</AppText>
                        </TouchableOpacity>
                    )}
                    {Number(ad.status) === 1 && (
                        <TouchableOpacity
                            style={[styles.actionBtn, isSaved && styles.savedBtn]}
                            onPress={handleSave}
                        >
                            <Icon name={isSaved ? "heart" : "heart-outline"} size={18} color={isSaved ? "#fff" : "#000"} />
                            <AppText style={[styles.actionBtnText, isSaved && styles.savedBtnText]}>
                                {isSaved ? "Tersimpan" : "Simpan"}
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Description Section */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Deskripsi</AppText>
                </View>
                <View style={styles.descriptionContent}>
                    <AppText style={styles.descriptionText}>{ad.description}</AppText>
                </View>

                {/* Seller Info */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Profil Penjual</AppText>
                </View>
                <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                        <Icon name="person" size={30} color="#757575" />
                    </View>
                    <View style={styles.sellerInfo}>
                        <AppText style={styles.sellerName}>{ad.user_name}</AppText>
                        <AppText style={styles.memberText}>
                            Bergabung sejak {new Date(ad.created_on).getFullYear()}
                        </AppText>
                    </View>
                    <TouchableOpacity
                        style={styles.viewProfileBtn}
                        onPress={() => navigation.navigate('UserAds', { userName: ad.user_name, userId: ad.user_id })}>
                        <Icon name="chevron-forward" size={24} color="#757575" />
                    </TouchableOpacity>
                </View>

                <View style={styles.adIdFooter}>
                    <AppText style={styles.adIdLabel}>ID Iklan: </AppText>
                    <AppText style={styles.adIdValue}>{ad.id}</AppText>
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
                        <AppText style={styles.fullPaginationText}>
                            {fullImageIndex + 1} / {adImages.length}
                        </AppText>
                    </View>
                </View>
            </Modal>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                {user?.id === ad?.user_id ? (
                    <>
                        <TouchableOpacity style={[styles.editBtn, { flex: 1 }]} onPress={handleEdit}>
                            <Icon name="create-outline" size={20} color="#fff" />
                            <AppText style={styles.waBtnText}>Edit Iklan</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.deleteAdBtn, { flex: 1 }]} onPress={handleDelete}>
                            <Icon name="trash-outline" size={20} color="#fff" />
                            <AppText style={styles.waBtnText}>Hapus Iklan</AppText>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
                        <Icon name="logo-whatsapp" size={20} color="#fff" />
                        <AppText style={styles.waBtnText}>Whatsapp Now</AppText>
                    </TouchableOpacity>
                )}
            </View>

            {/* Report Modal */}
            <Modal
                visible={isReportModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsReportModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.reportModalContainer}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitleText}>Laporkan Iklan Ini</AppText>
                            <TouchableOpacity onPress={() => setIsReportModalVisible(false)}>
                                <Icon name="close-circle" size={28} color="#757575" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.reportFormScroll}>
                            <AppText style={styles.inputLabel}>Apa yang ingin kamu laporkan?</AppText>
                            <View style={styles.inputWrapper}>
                                <AppTextInput
                                    style={styles.textInput}
                                    placeholder="Judul laporan"
                                    value={reportForm.title}
                                    onChangeText={(text: string) => setReportForm({ ...reportForm, title: text })}
                                />
                            </View>

                            <AppText style={styles.inputLabel}>Deskripsi</AppText>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <AppTextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Ketik deskripsi disini..."
                                    multiline
                                    numberOfLines={4}
                                    value={reportForm.description}
                                    onChangeText={(text: string) => setReportForm({ ...reportForm, description: text })}
                                />
                            </View>

                            <AppText style={styles.inputLabel}>Jenis Laporan:</AppText>
                            {[
                                "Penipuan",
                                "Produk Terjual",
                                "Duplikat",
                                "Mengandung Unsur Pornografi",
                                "Konten Mengganggu",
                                "Lainnya",
                            ].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.radioOption}
                                    onPress={() => setReportForm({ ...reportForm, type })}>
                                    <Icon
                                        name={reportForm.type === type ? "radio-button-on" : "radio-button-off"}
                                        size={20}
                                        color={reportForm.type === type ? "#002F34" : "#757575"}
                                    />
                                    <AppText style={styles.radioText}>{type}</AppText>
                                </TouchableOpacity>
                            ))}

                            <AppText style={styles.inputLabel}>Bukti Gambar (opsional)</AppText>
                            <View style={styles.reportImagesContainer}>
                                {reportImages.map((uri, index) => (
                                    <View key={index} style={styles.reportImageWrapper}>
                                        <Image source={{ uri }} style={styles.reportImagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeReportImageBtn}
                                            onPress={() => handleRemoveReportImage(index)}>
                                            <Icon name="close-circle" size={20} color="#D9534F" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {reportImages.length < 5 && (
                                    <TouchableOpacity style={styles.addReportImageBtn} onPress={handleAddReportImage}>
                                        <Icon name="camera-outline" size={30} color="#757575" />
                                        <AppText style={styles.addReportImageText}>Tambah</AppText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.submitReportBtn, (isReporting || isUploadingImage) && styles.disabledBtn]}
                            onPress={handleReport}
                            disabled={isReporting || isUploadingImage}>
                            {isReporting || isUploadingImage ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <AppText style={styles.submitReportBtnText}>Kirim Laporan</AppText>
                            )}
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
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
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F4F5',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#002F34',
    },
    savedBtn: {
        backgroundColor: '#002F34',
    },
    savedBtnText: {
        color: '#fff',
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
    adIdFooter: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    adIdLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002F34',
    },
    adIdValue: {
        fontSize: 14,
        color: '#002F34',
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
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002F34',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    deleteAdBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D9534F',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    reportModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    reportFormScroll: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002F34',
        marginBottom: 8,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    textInput: {
        height: 48,
        fontSize: 14,
        color: '#002F34',
    },
    textAreaWrapper: {
        height: 120,
        paddingVertical: 8,
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },
    radioText: {
        fontSize: 14,
        color: '#002F34',
    },
    submitReportBtn: {
        backgroundColor: '#D9534F',
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitReportBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.6,
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
        backgroundColor: 'green',
        borderRadius: 4,
        gap: 8,
    },
    waBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    reportImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    reportImageWrapper: {
        position: 'relative',
    },
    reportImagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeReportImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    addReportImageBtn: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F8F9',
    },
    addReportImageText: {
        fontSize: 10,
        color: '#757575',
        marginTop: 4,
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
