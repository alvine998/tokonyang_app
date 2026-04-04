import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    partner_code: string;
    status: boolean | number;
    save_ads?: string; // JSON string array of ad IDs
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
    updateUser: (updatedData: Partial<User>) => Promise<void>;
    otpTimer: number;
    startOtpTimer: (seconds?: number) => void;
}

// API configuration is now centralized in src/utils/api.ts

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
            const response = await api.get(`/users?id=${userId}`);

            console.log('[AUTH_DEBUG] Fetch User Details Response:', JSON.stringify(response.data, null, 2));

            // Support both { items: { rows: [...] } } and direct object or { data: [...] }
            let fullUserData = null;
            if (response.data?.items?.rows?.[0]) {
                fullUserData = response.data.items.rows[0];
                console.log('[AUTH_DEBUG] Found user in response.data.items.rows[0]');
            } else if (Array.isArray(response.data) && response.data.length > 0) {
                fullUserData = response.data[0];
                console.log('[AUTH_DEBUG] Found user in response.data[0] (Array)');
            } else if (response.data?.id) {
                fullUserData = response.data;
                console.log('[AUTH_DEBUG] Found user in response.data (Object with id)');
            }

            if (fullUserData) {
                console.log('[AUTH_DEBUG] User details found, saving and setting user state:', fullUserData.id);
                await AsyncStorage.setItem('user_session', JSON.stringify(fullUserData));
                setUser(fullUserData);
                return fullUserData;
            } else {
                console.log('[AUTH_DEBUG] No user details found in response. data keys:', Object.keys(response.data || {}));
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
            const response = await api.post(`/user/login`, {
                identity: phone,
                password
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
            const response = await api.post(`/otp/verify`, {
                email: identity,
                otp
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
            const response = await api.post(`/otp/send`, {
                email: identity
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
            const response = await api.post(`/otp/resend`, {
                email: identity
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
            const response = await api.post(`/user/forgot-password`, {
                email: identity
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
            const response = await api.post(`/user/reset-password`, payload);

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
            const response = await api.post(`/user`, payload);

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
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Send to your backend API
            console.log('[AUTH_DEBUG] Sending Google user info to backend:', userInfo.data?.user.email);
            const response = await api.post(`/user/login/by/google`, {
                email: userInfo.data?.user.email,
                uid: userInfo.data?.user.id,
                displayName: userInfo.data?.user.name,
                photoURL: userInfo.data?.user.photo,
                phoneNumber: null,
            });

            console.log('[AUTH_DEBUG] Google login API response status:', response.status);
            console.log('[AUTH_DEBUG] Google login API response data:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.user) {
                const initialUser = response.data.user;
                console.log('[AUTH_DEBUG] Google login successful, fetching details for ID:', initialUser.id || 'NO_ID');
                if (initialUser.id) {
                    await fetchUserDetails(initialUser.id);
                } else {
                    console.log('[AUTH_DEBUG] User object received but missing id, setting user from response data');
                    await AsyncStorage.setItem('user_session', JSON.stringify(initialUser));
                    setUser(initialUser);
                }
            } else {
                console.log('[AUTH_DEBUG] Google login response missing user object, keys found:', Object.keys(response.data || {}));
                throw new Error(response.data.message || 'Login Google gagal');
            }
        } catch (error: any) {
            console.error('[AUTH_DEBUG] loginWithGoogle catch error:', error.response?.data || error.message);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // ... (no changes)
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // ... (no changes)
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Play services tidak tersedia');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat login Google';
                throw new Error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Google SignOut error:', error);
        }
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('AsyncStorage clear error:', error);
            await AsyncStorage.removeItem('user_session');
        }
        setUser(null);
    };

    const updateUser = async (updatedData: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        await AsyncStorage.setItem('user_session', JSON.stringify(newUser));
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
            updateUser,
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
