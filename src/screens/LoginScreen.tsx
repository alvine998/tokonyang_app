import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Peringatan', 'Silakan isi no telepon dan password');
            return;
        }

        setLoading(true);
        try {
            await login(phone, password);
            navigation.navigate('Main');
        } catch (error: any) {
            Alert.alert('Login Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/tokotitoh.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Login Tokotitoh</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="No Telepon"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                                placeholder="Password"
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
                    </View>

                    <View style={styles.row}>
                        {/* <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <View style={[styles.checkbox, showPassword && styles.checkboxActive]}>
                                {showPassword && <Icon name="checkmark" size={12} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Tampilkan password</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Lupa Password</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Masuk</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.orText}>Atau</Text>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerButtonText}>Daftar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.googleButton}>
                        <View style={styles.googleIconContainer}>
                            <Icon name="logo-google" size={20} color="#EA4335" />
                        </View>
                        <Text style={styles.googleButtonText}>Login Dengan Google</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Dengan mendaftar atau login anda menyetujui{' '}
                        <Text
                            style={styles.footerLink}
                            onPress={() => navigation.navigate('SyaratKetentuan')}
                        >
                            syarat & ketentuan
                        </Text> dan{' '}
                        <Text
                            style={styles.footerLink}
                            onPress={() => navigation.navigate('KebijakanPrivasi')}
                        >
                            kebijakan privasi tokotitoh
                        </Text>
                    </Text>
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
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginBottom: 25,
        alignItems: 'center',
        marginTop: 10
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#2A9D8F',
        borderColor: '#2A9D8F',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#000',
    },
    linkText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '500',
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1B733F',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 15,
    },
    registerButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#E8580E',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    googleButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    googleIconContainer: {
        marginRight: 10,
    },
    googleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
    },
    footerText: {
        fontSize: 14,
        color: '#000',
        textAlign: 'center',
        lineHeight: 20,
    },
    footerLink: {
        color: '#2563EB',
    },
});

export default LoginScreen;
