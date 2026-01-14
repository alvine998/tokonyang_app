import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

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

const NotificationListScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { userId, status } = route.params || {};

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [limit, setLimit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT_INCREMENT = 10;

    useEffect(() => {
        fetchNotifications(10, true);
    }, []);

    const fetchNotifications = async (currentLimit: number, isInitial: boolean = false) => {
        if (!isInitial && (loadingMore || !hasMore)) return;

        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params: any = {
                page: 1,
                size: currentLimit,
            };

            // Add optional filters if provided
            if (userId) {
                params.user_id = userId;
            }
            if (status) {
                params.status = status;
            }

            const response = await axios.get('https://api.tokotitoh.co.id/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'bearer-token': 'tokotitohapi',
                    'x-partner-code': 'id.marketplace.tokotitoh'
                },
                params
            });

            if (response.data && response.data.items) {
                const newNotifications = response.data.items.rows || response.data.items;

                // Map API response to match our interface
                const mappedNotifications: Notification[] = newNotifications.map((item: any) => ({
                    id: item.id,
                    type: item.type || 'info',
                    title: item.title,
                    message: item.message || item.body || item.content,
                    createdAt: item.createdAt || item.created_at || item.created_on,
                    isRead: item.isRead ?? item.is_read ?? item.read ?? false,
                    actionType: item.actionType || item.action_type || 'none',
                    actionData: item.actionData || item.action_data,
                }));

                setNotifications(mappedNotifications);

                // Check if there are more items (if returned count equals limit, there might be more)
                if (newNotifications.length < currentLimit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            } else {
                if (isInitial) {
                    setNotifications([]);
                }
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (isInitial) {
                setNotifications([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setLimit(10);
        setHasMore(true);
        await fetchNotifications(10, true);
    }, [userId, status]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const newLimit = limit + LIMIT_INCREMENT;
            setLimit(newLimit);
            fetchNotifications(newLimit);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'transaction':
                return { name: 'receipt-outline', color: '#2196F3' };
            case 'promo':
                return { name: 'pricetag-outline', color: '#FF9800' };
            case 'info':
                return { name: 'information-circle-outline', color: '#4CAF50' };
            case 'system':
                return { name: 'settings-outline', color: '#9E9E9E' };
            default:
                return { name: 'notifications-outline', color: '#757575' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return `${diffMins} menit lalu`;
            }
            return `${diffHours} jam lalu`;
        } else if (diffDays === 1) {
            return 'Kemarin';
        } else if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );

        // Navigate to detail
        navigation.navigate('NotificationDetail', { notification });
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const iconConfig = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    !item.isRead && styles.unreadItem,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
                    <Icon name={iconConfig.name} size={24} color={iconConfig.color} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.notificationTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#BDBDBD" />
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Tidak Ada Notifikasi</Text>
            <Text style={styles.emptySubtitle}>
                Notifikasi terbaru akan muncul di sini
            </Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Notification List */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#002F34" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderNotificationItem}
                    contentContainerStyle={notifications.length === 0 ? styles.listEmpty : styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#002F34']}
                            tintColor="#002F34"
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color="#002F34" />
                                <Text style={styles.footerText}>Memuat lebih banyak...</Text>
                            </View>
                        ) : (
                            <View style={{ height: 20 }} />
                        )
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    listContent: {
        paddingVertical: 8,
    },
    listEmpty: {
        flex: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    unreadItem: {
        backgroundColor: '#F0F9FF',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#002F34',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2196F3',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 13,
        color: '#757575',
        marginTop: 4,
        lineHeight: 18,
    },
    notificationDate: {
        fontSize: 12,
        color: '#9E9E9E',
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#002F34',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginTop: 8,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    footerText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#757575',
    },
});

export default NotificationListScreen;
