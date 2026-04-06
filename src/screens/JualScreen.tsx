import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { uploadMultipleImagesToApi } from '../config/firebase';
interface Category {
    id: number;
    name: string;
    icon: string;
}

interface Subcategory {
    id: number;
    name: string;
    category_id: number;
}

interface Brand {
    id: number;
    name: string;
}

interface VehicleType {
    id: number;
    name: string;
}

interface Province {
    id: string;
    name: string;
}

interface City {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
}

const FUEL_TYPES = [
    { value: 'bensin', label: 'Bensin' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'ev', label: 'Listrik' },
];

const TRANSMISSION_TYPES = [
    { value: 'MT', label: 'Manual' },
    { value: 'AT', label: 'Automatic' },
    // { value: 'CVT', label: 'CVT' },
];

const CONDITION_TYPES = [
    { value: 'baru', label: 'Baru' },
    { value: 'bekas', label: 'Bekas' },
];

const JualScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user } = useAuth();
    const { editId, accountId } = route.params || {};

    // Step state (0-4: Category, Subcategory, Images, Form, Location)
    const [currentStep, setCurrentStep] = useState(editId ? 2 : 0);
    const [completedSteps, setCompletedSteps] = useState<number[]>(editId ? [1, 2, 3] : [1]);

    // Form data state
    const [formData, setFormData] = useState<any>({});
    const [images, setImages] = useState<string[]>([]);
    const [imageSizes, setImageSizes] = useState<number[]>([]);

    // Categories & Subcategories
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    // Brands & Types (for vehicles)
    const [brands, setBrands] = useState<Brand[]>([]);
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(false);

    // Locations
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Modal states
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showTransmissionModal, setShowTransmissionModal] = useState(false);
    const [showConditionModal, setShowConditionModal] = useState(false);
    const [showProvinceModal, setShowProvinceModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showDistrictModal, setShowDistrictModal] = useState(false);

    // Upload & Submit state
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // API configuration is now centralized in src/utils/api.ts

    // Check if any modal is visible
    const isAnyModalVisible = showBrandModal || showTypeModal || showFuelModal ||
        showTransmissionModal || showConditionModal || showProvinceModal ||
        showCityModal || showDistrictModal;

    const resetForm = () => {
        console.log('Resetting Jual screen state...');
        setCurrentStep(0);
        setCompletedSteps([1]);
        setFormData({});
        setImages([]);
        setImageSizes([]);
        setCities([]);
        setDistricts([]);
    };

    // Redirect to Login if user is not signed in and handle state reset on focus
    useFocusEffect(
        React.useCallback(() => {
            if (!user) {
                navigation.navigate('Login');
                return;
            }

            // Only reset if not editing an existing ad
            if (!route.params?.editId) {
                resetForm();
            } else {
                console.log('Jual screen focused in edit mode, not resetting.');
            }
        }, [user, navigation, route.params?.editId])
    );

    useEffect(() => {
        if (editId && route.params?.adData) {
            const ad = route.params.adData;
            console.log('Populating form data for editing:', ad.id);
            setFormData({
                ...ad,
                price: String(ad.price).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            });
            if (ad.images) {
                try {
                    const parsedImages = typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images;
                    setImages(parsedImages);
                    setImageSizes(new Array(parsedImages.length).fill(0));
                } catch (e) {
                    console.error('Error parsing images in JualScreen:', e);
                    if (Array.isArray(ad.images)) {
                        setImages(ad.images);
                    }
                }
            }
            
            // Fetch necessary data for dropdowns if needed
            if (ad.category_id) {
                fetchSubcategories(ad.category_id);
                fetchBrands(ad.category_id);
            }
            if (ad.province_id) {
                fetchCities(ad.province_id);
            }
            if (ad.city_id) {
                fetchDistricts(ad.city_id);
            }
        }
    }, [editId, route.params?.adData]);

    useEffect(() => {
        navigation.setOptions({
            tabBarStyle: isAnyModalVisible
                ? { display: 'none' }
                : { height: 70, paddingBottom: 10, paddingTop: 10 }
        });
    }, [isAnyModalVisible, navigation]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch categories
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await api.get('/categories');
            if (response.data?.items?.rows) {
                setCategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Fetch subcategories
    const fetchSubcategories = async (categoryId: number) => {
        setLoadingSubcategories(true);
        try {
            const response = await api.get(`/subcategories?category_id=${categoryId}`);
            if (response.data?.items?.rows) {
                setSubcategories(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoadingSubcategories(false);
        }
    };

    // Fetch brands
    const fetchBrands = async (categoryId: number) => {
        setLoadingBrands(true);
        try {
            const response = await api.get(`/brands?category_id=${categoryId}`);
            if (response.data?.items?.rows) {
                setBrands(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    // Fetch types
    const fetchTypes = async (brandId: number) => {
        setLoadingTypes(true);
        try {
            const response = await api.get(`/types?brand_id=${brandId}`);
            if (response.data?.items?.rows) {
                setTypes(response.data.items.rows);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        } finally {
            setLoadingTypes(false);
        }
    };

    // Fetch provinces
    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const response = await api.get('/provinces');
            const data = response.data?.items?.rows || response.data?.items || [];
            setProvinces(data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    // Fetch cities
    const fetchCities = async (provinceId: string) => {
        setLoadingCities(true);
        try {
            const response = await api.get(`/cities?province_id=${provinceId}`);
            const data = response.data?.items?.rows || response.data?.items || [];
            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoadingCities(false);
        }
    };

    // Fetch districts
    const fetchDistricts = async (cityId: string) => {
        setLoadingDistricts(true);
        try {
            const response = await api.get(`/districts?city_id=${cityId}`);
            const data = response.data?.items?.rows || response.data?.items || [];
            setDistricts(data);
        } catch (error) {
            console.error('Error fetching districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // Helper functions to check category type
    const isVehicleCategory = () => {
        const catName = formData.category_name?.toLowerCase() || '';
        const subName = formData.subcategory_name?.toLowerCase() || '';
        return (catName.includes('mobil') || catName.includes('motor')) &&
            (subName.includes('dijual') || subName.includes('mobil') || subName.includes('motor'));
    };

    const isPropertyCategory = () => {
        const catName = formData.category_name?.toLowerCase() || '';
        return catName.includes('properti');
    };

    const needsConditionField = () => {
        const catName = formData.category_name?.toLowerCase() || '';
        const subName = formData.subcategory_name?.toLowerCase() || '';

        // Property doesn't need condition
        if (catName.includes('properti')) {
            return false;
        }

        // Specific car / motor subcategories don't need condition
        if (
            subName.includes('baru') ||
            subName.includes('promosi') ||
            subName.includes('kredit') ||
            subName.includes('disewakan') ||
            ((catName.includes('mobil') || catName.includes('motor')) && subName.includes('dijual'))
        ) {
            return false;
        }

        // If the subcategory name itself contains "Bekas" or "Baru", we don't need to ask again.
        if (subName.includes('bekas') || subName.includes('baru')) {
            return false;
        }

        // Show for everything else
        return true;
    };

    const isBusTruckCategory = () => {
        const subName = formData.subcategory_name?.toLowerCase() || '';
        return subName.includes('bus dan truk') || subName.includes('alat berat');
    };

    // Handle category selection
    const handleCategorySelect = (category: Category) => {
        setFormData({
            ...formData,
            category_id: category.id,
            category_name: category.name,
        });
        setCompletedSteps([...completedSteps, 2]);
        setCurrentStep(1);
        fetchSubcategories(category.id);
        fetchBrands(category.id);
    };

    // Handle subcategory selection
    const handleSubcategorySelect = (subcategory: Subcategory) => {
        const subName = subcategory.name.toLowerCase();
        let autoCondition = formData.condition;

        if (subName.includes('bekas')) {
            autoCondition = 'bekas';
        } else if (subName.includes('baru')) {
            autoCondition = 'baru';
        }

        setFormData({
            ...formData,
            subcategory_id: subcategory.id,
            subcategory_name: subcategory.name,
            condition: autoCondition,
        });
        setCompletedSteps([...completedSteps, 3]);
        setCurrentStep(2);
    };

    // Handle image picker - stores local URIs, will upload when submitting ad
    const handleAddImage = async () => {
        if (images.length >= 10) {
            Alert.alert('Peringatan', 'Maksimal 10 gambar yang diperbolehkan.');
            return;
        }

        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 10 - images.length,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                console.error('ImagePicker Error:', result.errorMessage);
                Alert.alert('Error', result.errorMessage || 'Gagal memilih gambar');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                // Check total size limit (25 MB)
                const newAssets = result.assets;
                const newBatchSize = newAssets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0);
                const currentTotalSize = imageSizes.reduce((sum, size) => sum + size, 0);

                if (currentTotalSize + newBatchSize > 25 * 1024 * 1024) {
                    Alert.alert('Peringatan', 'Total ukuran gambar tidak boleh melebihi 25 MB.');
                    return;
                }

                // Store local URIs for display
                const selectedUris = newAssets
                    .map((asset: Asset) => asset.uri || '')
                    .filter((uri: string) => uri !== '');

                const selectedSizes = newAssets
                    .filter((asset: Asset) => asset.uri !== '')
                    .map((asset: Asset) => asset.fileSize || 0);

                if (selectedUris.length === 0) {
                    Alert.alert('Error', 'Gagal memilih gambar');
                    return;
                }

                // Add to images array (local URIs for now)
                setImages([...images, ...selectedUris]);
                setImageSizes([...imageSizes, ...selectedSizes]);
                console.log(`Added ${selectedUris.length} images, total size: ${((currentTotalSize + newBatchSize) / (1024 * 1024)).toFixed(2)} MB`);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal memilih gambar');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImageSizes(imageSizes.filter((_, i) => i !== index));
    };

    // Go to previous step
    const goBack = () => {
        const minStep = editId ? 2 : 0;
        if (currentStep > minStep) {
            setCurrentStep(currentStep - 1);
            setCompletedSteps(completedSteps.filter(s => s !== currentStep + 1));
        } else {
            navigation.goBack();
        }
    };

    // Validate form data
    const validateFormData = () => {
        const required = ['title', 'price', 'description', 'wa'];

        if (isVehicleCategory()) {
            required.push('brand_id', 'type_id', 'fuel_type', 'transmission', 'year');
        }

        if (needsConditionField()) {
            required.push('condition');
        }

        if (isPropertyCategory()) {
            required.push('area', 'building');
        }

        for (const field of required) {
            if (!formData[field] || formData[field] === '') {
                Alert.alert('Peringatan', `Harap lengkapi semua kolom yang wajib diisi!`);
                return false;
            }
        }
        return true;
    };

    // Validate location
    const validateLocation = () => {
        if (!formData.province_id || !formData.city_id || !formData.district_id) {
            Alert.alert('Peringatan', 'Harap lengkapi data lokasi!');
            return false;
        }
        return true;
    };

    // Handle next step from form
    const handleFormNext = () => {
        if (!validateFormData()) return;
        setCompletedSteps([...completedSteps, 5]);
        setCurrentStep(4);
        fetchProvinces();
    };

    // Handle images next
    const handleImagesNext = () => {
        if (images.length < 1) {
            Alert.alert('Peringatan', 'Harap tambahkan minimal 1 gambar!');
            return;
        }
        setCompletedSteps([...completedSteps, 4]);
        setCurrentStep(3);
    };

    // Upload a single image to API
    const uploadImageToApi = async (uri: string): Promise<string | null> => {
        try {
            const formData = new FormData();

            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            const response = await api.post('/file-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status !== 200) {
                console.error('Upload response not ok:', response.status);
                return null;
            }

            const result = response.data;
            console.log('Upload result:', result);

            // API returns: { status: "success", url: "...", code: 200 }
            if (result.status === 'success' && result.url) {
                return result.url;
            }

            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Submit ad
    const handleSubmit = async () => {
        if (!validateLocation()) return;
        if (images.length < 1) {
            Alert.alert('Peringatan', 'Gambar wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            // Upload images first if they are local URIs
            let imageUrls = images;

            const localImages = images.filter(img => img.startsWith('file://') || img.startsWith('content://'));

            if (localImages.length > 0) {
                console.log(`Uploading ${localImages.length} local images...`);
                setUploadingImage(true);

                const uploadPromises = localImages.map(uri => uploadImageToApi(uri));
                const uploadedUrls = await Promise.all(uploadPromises);

                // Filter out failed uploads and replace local URIs with uploaded URLs
                imageUrls = images.map((img, index) => {
                    if (img.startsWith('file://') || img.startsWith('content://')) {
                        const localIndex = localImages.indexOf(img);
                        const uploaded = uploadedUrls[localIndex];
                        return uploaded || img; // Keep local URI if upload failed (API might accept it)
                    }
                    return img;
                });

                setUploadingImage(false);
                console.log('Final image URLs:', imageUrls);
            }

            // Calculate expiry date (200 days from now)
            const today = new Date();
            const expiryDate = new Date(today);
            expiryDate.setDate(today.getDate() + 200);
            const expiredOn = expiryDate.toISOString().split('T')[0];

            // Build payload matching API format
            const payload = {
                title: formData.title,
                user_id: user?.id || formData.user_id || 1,
                user_name: user?.name || formData.user_name || 'User',
                brand_id: formData.brand_id || null,
                brand_name: formData.brand_name || null,
                type_id: formData.type_id || null,
                type_name: formData.type_name || null,
                category_id: formData.category_id,
                category_name: formData.category_name,
                subcategory_id: formData.subcategory_id,
                subcategory_name: formData.subcategory_name,
                price: parseInt(String(formData.price).replace(/\./g, ''), 10),
                description: formData.description,
                province_id: formData.province_id,
                province_name: formData.province_name,
                city_id: formData.city_id,
                city_name: formData.city_name,
                district_id: formData.district_id,
                district_name: formData.district_name,
                km: formData.km ? parseInt(formData.km, 10) : null,
                images: imageUrls,
                transmission: formData.transmission || null,
                year: formData.year || null,
                plat_no: formData.plat_no || null,
                color: formData.color || null,
                ownership: formData.ownership || 'individual',
                fuel_type: formData.fuel_type || null,
                condition: formData.condition || null,
                land_area: formData.area || null,
                building_area: formData.building || null,
                area: formData.area || null,
                building: formData.building || null,
                certificates: formData.certificates || null,
                wa: formData.wa || null,
                expired_on: expiredOn,
                status: 0,
            };

            console.log('Submitting payload:', payload);

            if (editId) {
                await api.patch('/ads', { ...payload, id: editId, status: 0 });
            } else {
                await api.post('/ads', payload);
            }

            Alert.alert(
                'Berhasil',
                'Iklan Anda telah berhasil dipasang!',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
        } catch (error) {
            console.error('Error submitting ad:', error);
            Alert.alert('Error', 'Gagal membuat iklan!');
        } finally {
            setSubmitting(false);
            setUploadingImage(false);
        }
    };

    // Format price with thousand separators
    const formatPrice = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map((step) => (
                <View
                    key={step}
                    style={[
                        styles.stepDot,
                        completedSteps.includes(step) && styles.stepDotCompleted
                    ]}
                >
                    <AppText style={[
                        styles.stepNumber,
                        completedSteps.includes(step) && styles.stepNumberCompleted
                    ]}>
                        {step}
                    </AppText>
                </View>
            ))}
        </View>
    );

    // Render selection modal
    const renderSelectionModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        data: any[],
        loading: boolean,
        onSelect: (item: any) => void,
        selectedId?: number | string,
        labelKey: string = 'name'
    ) => (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <AppText style={styles.modalTitle}>{title}</AppText>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color="#002F34" style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => (item.id ?? item.value ?? index).toString()}
                            renderItem={({ item }) => {
                                const itemId = item.id ?? item.value;
                                const isSelected = selectedId === itemId;
                                const displayText = item[labelKey] ?? item.label ?? item.name ?? '';

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            isSelected && styles.modalItemSelected
                                        ]}
                                        onPress={() => onSelect(item)}
                                    >
                                        <AppText style={styles.modalItemText}>
                                            {displayText}
                                        </AppText>
                                        {isSelected && (
                                            <Icon name="checkmark" size={24} color="#002F34" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={<AppText style={styles.emptyText}>Tidak ada data</AppText>}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );

    // Step 0: Select Category
    const renderCategoryStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#2152FF" />
                <AppText style={styles.backButtonText}>Kembali</AppText>
            </TouchableOpacity>
            <AppText style={styles.stepTitle}>Apa yang ingin anda jual?</AppText>
            {loadingCategories ? (
                <ActivityIndicator size="large" color="#002F34" style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.categoryList}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryItem}
                            onPress={() => handleCategorySelect(cat)}
                        >
                            <AppText style={styles.categoryItemText}>{cat.name}</AppText>
                            <Icon name="chevron-forward" size={20} color="#757575" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // Step 1: Select Subcategory
    const renderSubcategoryStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#2152FF" />
            </TouchableOpacity>
            <AppText style={styles.stepTitle}>Pilih Sub Kategori {formData.category_name}:</AppText>
            {loadingSubcategories ? (
                <ActivityIndicator size="large" color="#002F34" style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.categoryList}>
                    {subcategories.map((sub) => (
                        <TouchableOpacity
                            key={sub.id}
                            style={styles.categoryItem}
                            onPress={() => handleSubcategorySelect(sub)}
                        >
                            <AppText style={styles.categoryItemText}>{sub.name}</AppText>
                            <Icon name="chevron-forward" size={20} color="#757575" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // Step 2: Images
    const renderImagesStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#2152FF" />
            </TouchableOpacity>
            <AppText style={styles.stepTitle}>Pilih Gambar: (Maksimal 10)</AppText>

            <TouchableOpacity
                style={[styles.addImageButton, images.length >= 10 && styles.addImageButtonDisabled]}
                onPress={handleAddImage}
                disabled={images.length >= 10 || uploadingImage}
            >
                <Icon name="add" size={24} color={images.length >= 10 ? '#9E9E9E' : '#002F34'} />
                <AppText style={[styles.addImageText, images.length >= 10 && { color: '#9E9E9E' }]}>
                    Tambah Gambar
                </AppText>
            </TouchableOpacity>

            {uploadingImage && <AppText style={styles.uploadingText}>Mengunggah...</AppText>}

            <View style={styles.imageGrid}>
                {images.map((uri, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.imageContainer}
                        onPress={() => handleRemoveImage(index)}
                    >
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <View style={styles.imageOverlay}>
                            <Icon name="trash" size={20} color="#fff" />
                        </View>
                        {index === 0 && (
                            <View style={styles.mainPhotoBadge}>
                                <AppText style={styles.mainPhotoText}>Utama</AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleImagesNext}>
                <AppText style={styles.nextButtonText}>Selanjutnya</AppText>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // Step 3: Form Data
    const renderFormStep = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#2152FF" />
            </TouchableOpacity>
            <AppText style={styles.stepTitle}>
                {formData.category_name} {'>'} {formData.subcategory_name}
            </AppText>

            {/* Title */}
            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Judul *</AppText>
                <AppTextInput
                    style={styles.textInput}
                    placeholder="Masukkan Judul Iklan"
                    placeholderTextColor="#9E9E9E"
                    value={formData.title || ''}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    maxLength={40}
                />
                <AppText style={styles.charCount}>{(formData.title || '').length}/40</AppText>
            </View>

            {/* Brand & Type for vehicles */}
            {isVehicleCategory() && (
                <>
                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Merek *</AppText>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowBrandModal(true)}
                        >
                            <AppText style={formData.brand_name ? styles.selectorText : styles.selectorPlaceholder}>
                                {formData.brand_name || 'Pilih Merek'}
                            </AppText>
                            <Icon name="chevron-down" size={20} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Tipe *</AppText>
                        <TouchableOpacity
                            style={[styles.selector, types.length === 0 && styles.selectorDisabled]}
                            onPress={() => types.length > 0 && setShowTypeModal(true)}
                            disabled={types.length === 0}
                        >
                            <AppText style={formData.type_name ? styles.selectorText : styles.selectorPlaceholder}>
                                {formData.type_name || 'Pilih Tipe'}
                            </AppText>
                            <Icon name="chevron-down" size={20} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Jenis Bahan Bakar *</AppText>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowFuelModal(true)}
                        >
                            <AppText style={formData.fuel_type ? styles.selectorText : styles.selectorPlaceholder}>
                                {FUEL_TYPES.find(f => f.value === formData.fuel_type)?.label || 'Pilih Bahan Bakar'}
                            </AppText>
                            <Icon name="chevron-down" size={20} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Transmisi *</AppText>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowTransmissionModal(true)}
                        >
                            <AppText style={formData.transmission ? styles.selectorText : styles.selectorPlaceholder}>
                                {TRANSMISSION_TYPES.find(t => t.value === formData.transmission)?.label || 'Pilih Transmisi'}
                            </AppText>
                            <Icon name="chevron-down" size={20} color="#757575" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Tahun *</AppText>
                        <AppTextInput
                            style={styles.textInput}
                            placeholder="Masukkan Tahun"
                            placeholderTextColor="#9E9E9E"
                            value={formData.year || ''}
                            onChangeText={(text) => setFormData({ ...formData, year: text })}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>
                </>
            )}

            {/* Condition for applicable categories */}
            {needsConditionField() && (
                <View style={styles.inputGroup}>
                    <AppText style={styles.inputLabel}>Kondisi</AppText>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowConditionModal(true)}
                    >
                        <AppText style={formData.condition ? styles.selectorText : styles.selectorPlaceholder}>
                            {CONDITION_TYPES.find(c => c.value === formData.condition)?.label || 'Pilih Kondisi'}
                        </AppText>
                        <Icon name="chevron-down" size={20} color="#757575" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Year for bus/truck/heavy equipment */}
            {isBusTruckCategory() && !isVehicleCategory() && (
                <View style={styles.inputGroup}>
                    <AppText style={styles.inputLabel}>Tahun</AppText>
                    <AppTextInput
                        style={styles.textInput}
                        placeholder="Masukkan Tahun"
                        placeholderTextColor="#9E9E9E"
                        value={formData.year || ''}
                        onChangeText={(text) => setFormData({ ...formData, year: text })}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            )}

            {/* Property fields */}
            {isPropertyCategory() && (
                <>
                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Luas Tanah (m²) *</AppText>
                        <AppTextInput
                            style={styles.textInput}
                            placeholder="Masukkan Luas Tanah"
                            placeholderTextColor="#9E9E9E"
                            value={formData.area || ''}
                            onChangeText={(text) => setFormData({ ...formData, area: text.replace(/[^0-9]/g, '') })}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.inputLabel}>Luas Bangunan (m²) *</AppText>
                        <AppTextInput
                            style={styles.textInput}
                            placeholder="Masukkan Luas Bangunan"
                            placeholderTextColor="#9E9E9E"
                            value={formData.building || ''}
                            onChangeText={(text) => setFormData({ ...formData, building: text.replace(/[^0-9]/g, '') })}
                            keyboardType="numeric"
                        />
                    </View>
                </>
            )}

            {/* Price */}
            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Harga *</AppText>
                <View style={styles.priceInputContainer}>
                    <AppText style={styles.pricePrefix}>Rp</AppText>
                    <AppTextInput
                        style={styles.priceInput}
                        placeholder="0"
                        placeholderTextColor="#9E9E9E"
                        value={formData.price || ''}
                        onChangeText={(text) => setFormData({ ...formData, price: formatPrice(text) })}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Deskripsi *</AppText>
                <AppTextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Masukkan Deskripsi"
                    placeholderTextColor="#9E9E9E"
                    value={formData.description || ''}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    maxLength={1000}
                />
                <AppText style={styles.charCount}>{(formData.description || '').length}/1000</AppText>
            </View>

            {/* WhatsApp */}
            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Nomor WhatsApp *</AppText>
                <AppTextInput
                    style={styles.textInput}
                    placeholder="Masukkan Nomor WhatsApp"
                    placeholderTextColor="#9E9E9E"
                    value={formData.wa || ''}
                    onChangeText={(text) => setFormData({ ...formData, wa: text.replace(/[^0-9]/g, '') })}
                    keyboardType="phone-pad"
                    maxLength={15}
                />
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleFormNext}>
                <AppText style={styles.nextButtonText}>Selanjutnya</AppText>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // Step 4: Location
    const renderLocationStep = () => (
        <View style={styles.stepContent}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#2152FF" />
            </TouchableOpacity>
            <AppText style={styles.stepTitle}>Pilih Lokasi:</AppText>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Provinsi *</AppText>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowProvinceModal(true)}
                >
                    <AppText style={formData.province_name ? styles.selectorText : styles.selectorPlaceholder}>
                        {formData.province_name || 'Pilih Provinsi'}
                    </AppText>
                    <Icon name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Kota/Kabupaten *</AppText>
                <TouchableOpacity
                    style={[styles.selector, cities.length === 0 && styles.selectorDisabled]}
                    onPress={() => cities.length > 0 && setShowCityModal(true)}
                    disabled={cities.length === 0}
                >
                    <AppText style={formData.city_name ? styles.selectorText : styles.selectorPlaceholder}>
                        {formData.city_name || 'Pilih Kota/Kabupaten'}
                    </AppText>
                    <Icon name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Kecamatan *</AppText>
                <TouchableOpacity
                    style={[styles.selector, districts.length === 0 && styles.selectorDisabled]}
                    onPress={() => districts.length > 0 && setShowDistrictModal(true)}
                    disabled={districts.length === 0}
                >
                    <AppText style={formData.district_name ? styles.selectorText : styles.selectorPlaceholder}>
                        {formData.district_name || 'Pilih Kecamatan'}
                    </AppText>
                    <Icon name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <AppText style={styles.submitButtonText}>Selesai</AppText>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                {renderStepIndicator()}

                {currentStep === 0 && renderCategoryStep()}
                {currentStep === 1 && renderSubcategoryStep()}
                {currentStep === 2 && renderImagesStep()}
                {currentStep === 3 && renderFormStep()}
                {currentStep === 4 && renderLocationStep()}

                {/* Modals */}
                {renderSelectionModal(
                    showBrandModal,
                    () => setShowBrandModal(false),
                    'Pilih Merek',
                    brands,
                    loadingBrands,
                    (item) => {
                        setFormData({ ...formData, brand_id: item.id, brand_name: item.name });
                        setShowBrandModal(false);
                        fetchTypes(item.id);
                    },
                    formData.brand_id
                )}

                {renderSelectionModal(
                    showTypeModal,
                    () => setShowTypeModal(false),
                    'Pilih Tipe',
                    types,
                    loadingTypes,
                    (item) => {
                        setFormData({ ...formData, type_id: item.id, type_name: item.name });
                        setShowTypeModal(false);
                    },
                    formData.type_id
                )}

                {renderSelectionModal(
                    showFuelModal,
                    () => setShowFuelModal(false),
                    'Pilih Bahan Bakar',
                    FUEL_TYPES,
                    false,
                    (item) => {
                        setFormData({ ...formData, fuel_type: item.value });
                        setShowFuelModal(false);
                    },
                    formData.fuel_type,
                    'label'
                )}

                {renderSelectionModal(
                    showTransmissionModal,
                    () => setShowTransmissionModal(false),
                    'Pilih Transmisi',
                    TRANSMISSION_TYPES,
                    false,
                    (item) => {
                        setFormData({ ...formData, transmission: item.value });
                        setShowTransmissionModal(false);
                    },
                    formData.transmission,
                    'label'
                )}

                {renderSelectionModal(
                    showConditionModal,
                    () => setShowConditionModal(false),
                    'Pilih Kondisi',
                    CONDITION_TYPES,
                    false,
                    (item) => {
                        setFormData({ ...formData, condition: item.value });
                        setShowConditionModal(false);
                    },
                    formData.condition,
                    'label'
                )}

                {renderSelectionModal(
                    showProvinceModal,
                    () => setShowProvinceModal(false),
                    'Pilih Provinsi',
                    provinces,
                    loadingProvinces,
                    (item) => {
                        setFormData({ ...formData, province_id: item.id, province_name: item.name, city_id: undefined, city_name: undefined, district_id: undefined, district_name: undefined });
                        setCities([]);
                        setDistricts([]);
                        setShowProvinceModal(false);
                        fetchCities(item.id);
                    },
                    formData.province_id
                )}

                {renderSelectionModal(
                    showCityModal,
                    () => setShowCityModal(false),
                    'Pilih Kota/Kabupaten',
                    cities,
                    loadingCities,
                    (item) => {
                        setFormData({ ...formData, city_id: item.id, city_name: item.name, district_id: undefined, district_name: undefined });
                        setDistricts([]);
                        setShowCityModal(false);
                        fetchDistricts(item.id);
                    },
                    formData.city_id
                )}

                {renderSelectionModal(
                    showDistrictModal,
                    () => setShowDistrictModal(false),
                    'Pilih Kecamatan',
                    districts,
                    loadingDistricts,
                    (item) => {
                        setFormData({ ...formData, district_id: item.id, district_name: item.name });
                        setShowDistrictModal(false);
                    },
                    formData.district_id
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    stepDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotCompleted: {
        backgroundColor: '#2152FF',
        borderColor: '#2152FF',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    stepNumberCompleted: {
        color: '#fff',
    },
    stepContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButtonText: {
        color: '#2152FF',
        fontSize: 16,
        marginLeft: 8,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#002F34',
        marginBottom: 20,
    },
    categoryList: {
        borderTopWidth: 1,
        borderTopColor: '#F2F4F5',
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    categoryItemText: {
        fontSize: 18,
        color: '#002F34',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F7F8F9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#002F34',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#9E9E9E',
        textAlign: 'right',
        marginTop: 4,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F7F8F9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    selectorDisabled: {
        opacity: 0.5,
    },
    selectorText: {
        fontSize: 16,
        color: '#002F34',
    },
    selectorPlaceholder: {
        fontSize: 16,
        color: '#9E9E9E',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8F9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    pricePrefix: {
        paddingLeft: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#002F34',
    },
    priceInput: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 14,
        fontSize: 16,
        color: '#002F34',
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderStyle: 'dashed',
        gap: 8,
    },
    addImageButtonDisabled: {
        opacity: 0.5,
    },
    addImageText: {
        fontSize: 16,
        color: '#002F34',
        fontWeight: '500',
    },
    uploadingText: {
        textAlign: 'center',
        color: '#757575',
        marginTop: 8,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        gap: 8,
    },
    imageContainer: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    mainPhotoBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
    },
    mainPhotoText: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#2152FF',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#002F34',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        backgroundColor: '#9E9E9E',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    modalItemSelected: {
        backgroundColor: '#F0F9FF',
    },
    modalItemText: {
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

export default JualScreen;
