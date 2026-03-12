import React, { useState, useEffect, useRef } from 'react';
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
    TextInput,
} from 'react-native';
import AppText from '../components/AppText';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import normalize from 'react-native-normalize';

const OTPScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { identity, reason } = route.params || {};
    const { verifyOTP, resendOTP, otpTimer } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        // Handle Paste
        if (value.length > 1) {
            const pastedCode = value.replace(/[^0-9]/g, '').slice(0, 6);
            if (pastedCode.length > 0) {
                const newOtp = [...otp];
                pastedCode.split('').forEach((char, i) => {
                    if (index + i < 6) {
                        newOtp[index + i] = char;
                    }
                });
                setOtp(newOtp);
                // Focus the appropriate field
                const focusIndex = Math.min(index + pastedCode.length, 5);
                inputRefs.current[focusIndex]?.focus();
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input on entry
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto focus previous input on delete
        else if (value === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace when field is already empty
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();

            // Optional: also clear the previous field if focus moves back via backspace on empty field
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            Alert.alert('Peringatan', 'Silakan masukkan 6 digit kode OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(identity, otpString);
            
            // Add a small delay to ensure state transitions in AuthContext are fully handled
            // before navigating to protected screens
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

            if (reason === 'forgot_password') {
                navigation.navigate('ResetPassword', { identity, otp: otpString });
            } else {
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
        } catch (error: any) {
            Alert.alert('Verifikasi Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (otpTimer > 0) return;

        setResending(true);
        try {
            await resendOTP(identity);
            Alert.alert('Sukses', 'Kode OTP telah dikirim ulang');
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setResending(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        <AppText style={styles.title}>Verifikasi Kode OTP</AppText>
                        <AppText style={styles.subtitle}>
                            Masukkan 6 digit kode yang dikirim ke {identity}
                        </AppText>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    selectTextOnFocus
                                    textContentType="oneTimeCode"
                                />
                            ))}
                        </View>

                        <View style={styles.resendContainer}>
                            {otpTimer > 0 ? (
                                <AppText style={styles.timerText}>
                                    Kirim ulang dalam <AppText style={styles.timerHighlight}>{formatTimer(otpTimer)}</AppText>
                                </AppText>
                            ) : (
                                <TouchableOpacity onPress={handleResend} disabled={resending}>
                                    {resending ? (
                                        <ActivityIndicator size="small" color="#1B733F" />
                                    ) : (
                                        <AppText style={styles.resendText}>Kirim Ulang OTP</AppText>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <AppText style={styles.verifyButtonText}>Verifikasi</AppText>
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
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: normalize(24),
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: normalize(45),
        height: normalize(55),
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        fontSize: normalize(20),
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        backgroundColor: '#F9FAFB',
    },
    resendContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    timerText: {
        fontSize: normalize(14),
        color: '#6B7280',
    },
    timerHighlight: {
        color: '#E8580E',
        fontWeight: 'bold',
    },
    resendText: {
        fontSize: normalize(14),
        color: '#1B733F',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    verifyButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1B733F',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OTPScreen;
