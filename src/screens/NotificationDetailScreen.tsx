import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Notification {
    id: number;
    type: 'transaction' | 'promo' | 'info' | 'system';
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    actionType?: 'viewAd' | 'contact' | 'none';
    actionData?: any;
}

const NotificationDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { notification } = route.params as { notification: Notification };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'transaction':
                return { name: 'receipt-outline', color: '#2196F3', bg: '#E3F2FD' };
            case 'promo':
                return { name: 'pricetag-outline', color: '#FF9800', bg: '#FFF3E0' };
            case 'info':
                return { name: 'information-circle-outline', color: '#4CAF50', bg: '#E8F5E9' };
            case 'system':
                return { name: 'settings-outline', color: '#9E9E9E', bg: '#FAFAFA' };
            default:
                return { name: 'notifications-outline', color: '#757575', bg: '#F5F5F5' };
        }
    };

    const getTypeLabel = (type: Notification['type']) => {
        switch (type) {
            case 'transaction':
                return 'Transaksi';
            case 'promo':
                return 'Promo';
            case 'info':
                return 'Informasi';
            case 'system':
                return 'Sistem';
            default:
                return 'Notifikasi';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleAction = () => {
        if (notification.actionType === 'viewAd' && notification.actionData?.adId) {
            navigation.navigate('AdDetail', { adId: notification.actionData.adId });
        } else if (notification.actionType === 'contact') {
            // Handle contact action
        }
    };

    const iconConfig = getNotificationIcon(notification.type);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Notifikasi</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Type Badge & Icon */}
                <View style={styles.topSection}>
                    <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
                        <Icon name={iconConfig.name} size={40} color={iconConfig.color} />
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: `${iconConfig.color}20` }]}>
                        <Text style={[styles.typeText, { color: iconConfig.color }]}>
                            {getTypeLabel(notification.type)}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{notification.title}</Text>

                {/* Date */}
                <View style={styles.dateContainer}>
                    <Icon name="time-outline" size={16} color="#9E9E9E" />
                    <Text style={styles.dateText}>{formatDate(notification.createdAt)}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Message */}
                <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Pesan</Text>
                    <Text style={styles.messageText}>{notification.message}</Text>
                </View>

                {/* Action Button */}
                {notification.actionType && notification.actionType !== 'none' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleAction}
                        activeOpacity={0.8}
                    >
                        <Icon
                            name={notification.actionType === 'viewAd' ? 'eye-outline' : 'chatbubble-outline'}
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>
                            {notification.actionType === 'viewAd' ? 'Lihat Iklan' : 'Hubungi'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Additional Info */}
                {/* <View style={styles.additionalInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID Notifikasi</Text>
                        <Text style={styles.infoValue}>#{notification.id}</Text>
                    </View>
                </View> */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#002F34',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 30,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 14,
        color: '#9E9E9E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F4F5',
        marginVertical: 24,
    },
    messageContainer: {
        marginBottom: 24,
    },
    messageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginBottom: 10,
    },
    messageText: {
        fontSize: 16,
        color: '#404E50',
        lineHeight: 26,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002F34',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 10,
        marginBottom: 24,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    additionalInfo: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#757575',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002F34',
    },
});

export default NotificationDetailScreen;
