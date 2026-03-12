import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    partner_code: string;
    status: boolean | number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (phone: string, password: string) => Promise<any>;
    loginWithGoogle: () => Promise<void>;
    register: (payload: any) => Promise<void>;
    logout: () => Promise<void>;
    verifyOTP: (identity: string, otp: string) => Promise<void>;
    sendOTP: (identity: string) => Promise<void>;
    resendOTP: (identity: string) => Promise<void>;
    forgotPassword: (identity: string) => Promise<void>;
    resetPassword: (payload: any) => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    otpTimer: number;
    startOtpTimer: (seconds?: number) => void;
}

const API_BASE_URL = 'https://api.tokotitoh.co.id';
const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'bearer-token': 'tokotitohapi',
    'x-partner-code': 'id.marketplace.tokotitoh'
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [otpTimer, setOtpTimer] = React.useState<number>(0);

    React.useEffect(() => {
        let interval: any;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const startOtpTimer = (seconds: number = 60) => {
        setOtpTimer(seconds);
    };

    React.useEffect(() => {
        checkSession();
        setupGoogleSignIn();
    }, []);

    const setupGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: '480874086535-7be0ntidffu72ab6ejothp81p74rt24i.apps.googleusercontent.com',
            offlineAccess: true,
        });
    };

    const checkSession = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user_session');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Refresh details in background
                fetchUserDetails(parsedUser.id);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDetails = async (userId: number) => {
        console.log('Fetching user details for ID:', userId);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/users?id=${userId}`, {
                headers: AUTH_HEADERS
            });

            console.log('Fetch User Details Response:', JSON.stringify(response.data, null, 2));

            // Support both { items: { rows: [...] } } and direct object or { data: [...] }
            let fullUserData = null;
            if (response.data?.items?.rows?.[0]) {
                fullUserData = response.data.items.rows[0];
            } else if (Array.isArray(response.data) && response.data.length > 0) {
                fullUserData = response.data[0];
            } else if (response.data?.id) {
                fullUserData = response.data;
            }

            if (fullUserData) {
                console.log('User details found, saving and setting user state');
                await AsyncStorage.setItem('user_session', JSON.stringify(fullUserData));
                setUser(fullUserData);
                return fullUserData;
            } else {
                console.log('No user details found in response. Structure might be different.');
            }
        } catch (error: any) {
            console.error('Failed to fetch user details:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
        return null;
    };

    const login = async (phone: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, {
                identity: phone,
                password
            }, {
                headers: AUTH_HEADERS
            });

            console.log(response.data, "=> Login Data")

            if (response.data && response.status === 200) {
                startOtpTimer(60);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Login gagal');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat login';
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async (identity: string, otp: string) => {
        console.log('Verifying OTP for:', identity);
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/otp/verify`, {
                email: identity,
                otp
            }, {
                headers: AUTH_HEADERS
            });

            console.log('OTP Verify Response status:', response.status);
            console.log('OTP Verify Response data:', JSON.stringify(response.data, null, 2));

            // Be more flexible with the user object structure
            const userData = response.data.user || (response.data.id ? response.data : null);

            if (userData && userData.id) {
                console.log('Found user in OTP response, setting fallback and fetching full details');
                // Set fallback user immediately to avoid null gaps
                setUser(userData);
                await fetchUserDetails(userData.id);
            } else if (response.status === 200 || response.status === 201) {
                console.log('OTP Success but no user object detected in response');
                return;
            } else {
                throw new Error(response.data.message || 'Verifikasi OTP gagal');
            }
        } catch (error: any) {
            console.error('OTP Verify Error:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat verifikasi OTP';
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const sendOTP = async (identity: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/otp/send`, {
                email: identity
            }, {
                headers: AUTH_HEADERS
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data.message || 'Gagal mengirim OTP');
            }
            startOtpTimer(60);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengirim OTP';
            throw new Error(errorMessage);
        }
    };

    const resendOTP = async (identity: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/otp/resend`, {
                email: identity
            }, {
                headers: AUTH_HEADERS
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data.message || 'Gagal mengirim ulang OTP');
            }
            startOtpTimer(60);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengirim ulang OTP';
            throw new Error(errorMessage);
        }
    };

    const forgotPassword = async (identity: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/forgot-password`, {
                email: identity
            }, {
                headers: AUTH_HEADERS
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data.message || 'Gagal mengirim permintaan lupa password');
            }
            startOtpTimer(60);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat meminta lupa password';
            throw new Error(errorMessage);
        }
    };

    const resetPassword = async (payload: any) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/reset-password`, payload, {
                headers: AUTH_HEADERS
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data.message || 'Gagal mengatur ulang password');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengatur ulang password';
            throw new Error(errorMessage);
        }
    };

    const register = async (payload: any) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user`, payload, {
                headers: AUTH_HEADERS
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(response.data.message || 'Pendaftaran gagal');
            }
            startOtpTimer(60);
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat pendaftaran';
            throw new Error(errorMessage);
        }
    };

    const loginWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Send to your backend API
            // Note: Since I don't have the specific endpoint, I'll assume /user/login-google
            // or we might need to register them first if they don't exist.
            const response = await axios.post(`${API_BASE_URL}/user/login-google`, {
                idToken: userInfo.data?.idToken,
                email: userInfo.data?.user.email,
                name: userInfo.data?.user.name,
                google_id: userInfo.data?.user.id,
            }, {
                headers: AUTH_HEADERS
            });

            if (response.data && response.data.user) {
                const initialUser = response.data.user;
                await fetchUserDetails(initialUser.id);
            } else {
                throw new Error(response.data.message || 'Login Google gagal');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                throw new Error('Play services tidak tersedia');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat login Google';
                throw new Error(errorMessage);
            }
        }
    };

    const logout = async () => {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Google SignOut error:', error);
        }
        await AsyncStorage.removeItem('user_session');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            loginWithGoogle,
            register,
            logout,
            verifyOTP,
            sendOTP,
            resendOTP,
            forgotPassword,
            resetPassword,
            setUser,
            otpTimer,
            startOtpTimer
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
