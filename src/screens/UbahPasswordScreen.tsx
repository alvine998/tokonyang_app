import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UbahPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const userId = user?.id;

    const [saving, setSaving] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const API_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bearer-token': 'tokotitohapi',
        'x-partner-code': 'id.marketplace.tokotitoh'
    };

    const validateForm = (): boolean => {
        if (!currentPassword.trim()) {
            Alert.alert('Peringatan', 'Password saat ini wajib diisi!');
            return false;
        }

        if (!newPassword.trim()) {
            Alert.alert('Peringatan', 'Password baru wajib diisi!');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Peringatan', 'Password baru minimal 6 karakter!');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Peringatan', 'Konfirmasi password tidak cocok!');
            return false;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Peringatan', 'Password baru harus berbeda dengan password saat ini!');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!userId) {
            Alert.alert('Error', 'Sesi tidak ditemukan. Silakan login kembali.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                id: userId,
                password: newPassword,
            };

            await axios.patch(
                'https://api.tokotitoh.co.id/user',
                payload,
                { headers: API_HEADERS }
            );

            Alert.alert(
                'Berhasil',
                'Password berhasil diubah!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || 'Gagal mengubah password!';
            Alert.alert('Error', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const renderPasswordInput = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        showPassword: boolean,
        toggleShowPassword: () => void,
        placeholder: string
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder={placeholder}
                    placeholderTextColor="#9E9E9E"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={toggleShowPassword}
                >
                    <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#757575"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                    <Text style={styles.headerTitle}>Ubah Password</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Icon name="shield-checkmark-outline" size={24} color="#007A7C" />
                        <Text style={styles.infoText}>
                            Untuk keamanan akun Anda, gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {renderPasswordInput(
                            'Password Saat Ini *',
                            currentPassword,
                            setCurrentPassword,
                            showCurrentPassword,
                            () => setShowCurrentPassword(!showCurrentPassword),
                            'Masukkan password saat ini'
                        )}

                        {renderPasswordInput(
                            'Password Baru *',
                            newPassword,
                            setNewPassword,
                            showNewPassword,
                            () => setShowNewPassword(!showNewPassword),
                            'Masukkan password baru'
                        )}

                        <View style={styles.passwordHint}>
                            <Icon name="information-circle-outline" size={16} color="#757575" />
                            <Text style={styles.passwordHintText}>Minimal 6 karakter</Text>
                        </View>

                        {renderPasswordInput(
                            'Konfirmasi Password Baru *',
                            confirmPassword,
                            setConfirmPassword,
                            showConfirmPassword,
                            () => setShowConfirmPassword(!showConfirmPassword),
                            'Masukkan ulang password baru'
                        )}

                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <View style={styles.matchIndicator}>
                                <Icon
                                    name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                                    size={18}
                                    color={newPassword === confirmPassword ? '#4CAF50' : '#F44336'}
                                />
                                <Text style={[
                                    styles.matchText,
                                    { color: newPassword === confirmPassword ? '#4CAF50' : '#F44336' }
                                ]}>
                                    {newPassword === confirmPassword ? 'Password cocok' : 'Password tidak cocok'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Ubah Password</Text>
                        )}
                    </TouchableOpacity>

                    {/* Forgot Password Link */}
                    <TouchableOpacity style={styles.forgotPasswordLink}>
                        <Text style={styles.forgotPasswordText}>Lupa password saat ini?</Text>
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
    content: {
        flex: 1,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E8F5E9',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#2E7D32',
        lineHeight: 20,
    },
    formSection: {
        backgroundColor: '#fff',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002F34',
        marginBottom: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#002F34',
    },
    eyeButton: {
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    passwordHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -12,
        marginBottom: 16,
    },
    passwordHintText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#757575',
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -12,
    },
    matchText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '500',
    },
    saveButton: {
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
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    forgotPasswordLink: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#007A7C',
        fontWeight: '600',
    },
});

export default UbahPasswordScreen;
