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
    login: (phone: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (payload: any) => Promise<void>;
    logout: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
        try {
            const response = await axios.get(`${API_BASE_URL}/users?id=${userId}`, {
                headers: AUTH_HEADERS
            });

            if (response.data && response.data.items && response.data.items.rows && response.data.items.rows.length > 0) {
                const fullUserData = response.data.items.rows[0];
                await AsyncStorage.setItem('user_session', JSON.stringify(fullUserData));
                setUser(fullUserData);
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        }
    };

    const login = async (phone: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, {
                identity: phone,
                password
            }, {
                headers: AUTH_HEADERS
            });

            console.log(response.data)

            if (response.data && response.data.user) {
                const initialUser = response.data.user;
                // Fetch full details immediately after login
                await fetchUserDetails(initialUser.id);
            } else {
                throw new Error(response.data.message || 'Login gagal');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat login';
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
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout, setUser }}>
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
