import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import { useNavigation } from '@react-navigation/native';
import { formatAdDate } from '../utils/dateUtils';

interface AdListItemProps {
    item: {
        id: number;
        title: string;
        price: number;
        images: string;
        created_on: string;
    };
}

const AdListItem: React.FC<AdListItemProps> = ({ item }) => {
    const navigation = useNavigation<any>();

    let imageUrl = 'https://via.placeholder.com/150';
    try {
        const images = JSON.parse(item.images);
        if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
        }
    } catch (e) {
        // Fallback if parsing fails or images is not a JSON string
        if (typeof item.images === 'string' && item.images.startsWith('http')) {
            imageUrl = item.images;
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
        >
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.topInfo}>
                    <AppText style={styles.price}>{formatPrice(item.price)}</AppText>
                    <AppText style={styles.title} numberOfLines={2}>
                        {item.title}
                    </AppText>
                </View>
                <AppText style={styles.date}>{formatAdDate(item.created_on)}</AppText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    image: {
        width: 130,
        height: 130,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    topInfo: {
        flex: 1,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        lineHeight: 20,
    },
    date: {
        fontSize: 14,
        color: '#757575',
        alignSelf: 'flex-end',
    },
});

export default AdListItem;
