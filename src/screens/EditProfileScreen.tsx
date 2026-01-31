import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, setUser } = useAuth();
    const userId = user?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [profile, setProfile] = useState<any>({
        id: 0,
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
        bio: '',
    });

    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bearer-token': 'tokotitohapi',
        'x-partner-code': 'id.marketplace.tokotitoh'
    };

    const fetchProfile = async (id: number) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.tokotitoh.co.id/users?id=${id}`,
                { headers: API_HEADERS }
            );
            if (response.data?.items?.rows && response.data.items.rows.length > 0) {
                const data = response.data.items.rows[0];
                setProfile({
                    id: data.id || 0,
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    image: data.image || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProfile(Number(userId));
        }
    }, [userId]);

    const handleChangeAvatar = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            });

            if (result.didCancel) return;

            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Gagal memilih gambar');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.uri) {
                    setUploadingAvatar(true);
                    try {
                        // Upload avatar to API
                        const formData = new FormData();
                        const filename = asset.uri.split('/').pop() || 'avatar.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : 'image/jpeg';

                        formData.append('file', {
                            uri: asset.uri,
                            name: filename,
                            type: type,
                        } as any);

                        const uploadResponse = await fetch('https://api.tokotitoh.co.id/file-upload', {
                            method: 'POST',
                            headers: {
                                'bearer-token': 'tokotitohapi',
                                'x-partner-code': 'id.marketplace.tokotitoh',
                            },
                            body: formData,
                        });

                        const uploadResult = await uploadResponse.json();
                        console.log('image upload response:', uploadResult);

                        // If the API returns a URL, use it (typically firebasestorage.googleapis.com)
                        if (uploadResult.url) {
                            setProfile({ ...profile, image: uploadResult.url });
                        } else if (uploadResult.data?.url) {
                            setProfile({ ...profile, image: uploadResult.data.url });
                        } else {
                            throw new Error('Upload success but no URL returned');
                        }
                    } catch (uploadError: any) {
                        console.error('image upload error:', uploadError);
                        // Fallback to local URI so user sees the image, but warn them
                        setProfile({ ...profile, image: asset.uri });
                        Alert.alert('Info', 'Gagal mengunggah ke server. Menggunakan gambar lokal (mungkin tidak tersimpan secara permanen).');
                    } finally {
                        setUploadingAvatar(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal memilih foto');
        }
    };

    const handleSave = async () => {
        if (!profile.name.trim()) {
            Alert.alert('Peringatan', 'Nama wajib diisi!');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                id: profile.id || userId || 1,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                image: profile.image,
            };

            await axios.patch(
                'https://api.tokotitoh.co.id/user',
                payload,
                { headers: API_HEADERS }
            );

            // Update local storage and global state
            if (user && setUser) {
                const updatedUser = { ...user, ...payload } as any;
                await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            Alert.alert(
                'Berhasil',
                'Profil berhasil diperbarui!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Gagal menyimpan profil!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#002F34" />
                    <Text style={styles.loadingText}>Memuat profil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={28} color="#002F34" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profil</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#007A7C" />
                        ) : (
                            <Text style={styles.saveButton}>Simpan</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* image Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {profile.image ? (
                                <Image
                                    source={{ uri: profile.image }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <Icon name="person-circle" size={100} color="#E0E0E0" />
                            )}
                            {uploadingAvatar && (
                                <View style={styles.avatarLoadingOverlay}>
                                    <ActivityIndicator size="small" color="#fff" />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.changeAvatarBtn}
                            onPress={handleChangeAvatar}
                            disabled={uploadingAvatar}
                        >
                            <Icon name="camera-outline" size={18} color="#007A7C" />
                            <Text style={styles.changeAvatarText}>Ubah Foto</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nama Lengkap *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Masukkan nama lengkap"
                                placeholderTextColor="#9E9E9E"
                                value={profile.name}
                                onChangeText={(text) => setProfile({ ...profile, name: text })}
                                maxLength={100}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Masukkan email"
                                placeholderTextColor="#9E9E9E"
                                value={profile.email}
                                onChangeText={(text) => setProfile({ ...profile, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nomor Telepon</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Masukkan nomor telepon"
                                placeholderTextColor="#9E9E9E"
                                value={profile.phone}
                                onChangeText={(text) => setProfile({ ...profile, phone: text.replace(/[^0-9]/g, '') })}
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </View>
                    </View>

                    {/* Save Button (Mobile) */}
                    <TouchableOpacity
                        style={[styles.saveButtonMobile, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonMobileText}>Simpan Perubahan</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#757575',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007A7C',
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeAvatarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changeAvatarText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#007A7C',
    },
    formSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002F34',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#002F34',
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#9E9E9E',
        marginTop: 4,
    },
    saveButtonMobile: {
        backgroundColor: '#002F34',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#757575',
    },
    saveButtonMobileText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default EditProfileScreen;
