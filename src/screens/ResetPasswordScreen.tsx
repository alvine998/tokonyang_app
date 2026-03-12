import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import normalize from 'react-native-normalize';

const ResetPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { identity, otp } = route.params || {};
    const { resetPassword, login } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Peringatan', 'Silakan isi password baru Anda');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Peringatan', 'Password minimal 6 karakter');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Peringatan', 'Konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                email: identity,
                otp,
                password,
                password_confirmation: confirmPassword
            });

            // Auto login after reset
            try {
                await login(identity, password);
            } catch (loginError) {
                console.log('Auto-login failed after reset:', loginError);
            }

            Alert.alert('Sukses', 'Password Anda berhasil diatur ulang.', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: 'Main',
                                        state: {
                                            index: 4, // Index of Akun Saya tab
                                            routes: [
                                                { name: 'Home' },
                                                { name: 'Menu' },
                                                { name: 'Jual' },
                                                { name: 'Iklan Saya' },
                                                { name: 'Akun Saya' }
                                            ]
                                        }
                                    }
                                ]
                            })
                        );
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Icon name="refresh-circle-outline" size={normalize(80)} color="#1B733F" />
                        <AppText style={styles.title}>Atur Ulang Password</AppText>
                        <AppText style={styles.subtitle}>
                            Silakan masukkan password baru untuk mengamankan akun Anda.
                        </AppText>

                        <View style={styles.inputContainer}>
                            <View style={styles.passwordWrapper}>
                                <AppTextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                                    placeholder="Password Baru"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{ padding: 10 }}
                                >
                                    <Icon
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.passwordWrapper, { marginTop: 15 }]}>
                                <AppTextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                                    placeholder="Konfirmasi Password Baru"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ padding: 10 }}
                                >
                                    <Icon
                                        name={showConfirmPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.resetButton, loading && { opacity: 0.7 }]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <AppText style={styles.resetButtonText}>Atur Ulang Password</AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 20,
        flexGrow: 1,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: normalize(24),
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 40,
    },
    passwordWrapper: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: normalize(16),
        paddingHorizontal: 15,
    },
    resetButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1B733F',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ResetPasswordScreen;
