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

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !phone || !email || !password || !confirmPassword) {
            Alert.alert('Peringatan', 'Silakan isi semua data');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Peringatan', 'Konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            await register({
                name,
                email,
                phone,
                password,
                role: 'customer',
                google_id: '',
                status: 1
            });

            Alert.alert('Sukses', 'Pendaftaran berhasil. Silakan login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            Alert.alert('Pendaftaran Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/tokotitoh.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Daftar Tokotitoh</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nama"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="No Telepon"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Konfirmasi Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setShowPassword(!showPassword)}>
                        <View style={[styles.checkbox, showPassword && styles.checkboxActive]}>
                            {showPassword && <Icon name="checkmark" size={12} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxLabel}>Tampilkan password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.registerButton, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Daftar</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.orText}>Atau</Text>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
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
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#000',
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#9E9E9E',
        borderRadius: 2,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#1B7C3D',
        borderColor: '#1B7C3D',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#000',
    },
    registerButton: {
        backgroundColor: '#1B7C3D', // Green from design
        height: 48,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: {
        textAlign: 'center',
        color: '#000',
        marginBottom: 16,
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#EF5714', // Orange from design
        height: 48,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        color: '#000',
        fontSize: 13,
        lineHeight: 18,
    },
    footerLink: {
        color: '#2152FF',
        fontWeight: '500',
    },
});

export default RegisterScreen;
