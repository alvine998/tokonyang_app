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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import normalize from 'react-native-normalize';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async () => {
        if (!email) {
            Alert.alert('Peringatan', 'Silakan isi email Anda');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            navigation.navigate('OTP', {
                identity: email,
                reason: 'forgot_password'
            });
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
            console.log(error);
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
                    <View style={styles.logoContainer}>
                        <Icon name="lock-open-outline" size={normalize(80)} color="#1B733F" />
                        <AppText style={styles.title}>Lupa Password?</AppText>
                        <AppText style={styles.subtitle}>
                            Masukkan email atau nomor telepon akun Anda untuk menerima kode verifikasi OTP.
                        </AppText>
                    </View>

                    <View style={styles.inputContainer}>
                        <AppTextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.resetButton, loading && { opacity: 0.7 }]}
                        onPress={handleRequestReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <AppText style={styles.resetButtonText}>Kirim Kode OTP</AppText>
                        )}
                    </TouchableOpacity>
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
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
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
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: normalize(16),
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

export default ForgotPasswordScreen;
