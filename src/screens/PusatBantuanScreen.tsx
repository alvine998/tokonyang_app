import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PusatBantuanScreen = () => {
    const navigation = useNavigation();

    const sections = [
        {
            title: 'Cara Mendaftar Akun Tokotitoh',
            content: 'Anda memiliki 2 pilihan:',
            subsections: [
                {
                    subtitle: 'Melalui Google',
                    text: 'Pengguna dapat login melalui Google, sesuai dengan email yang digunakan pada akun Google yang sinkron di handphone Anda. Pastikan memasukkan kata sandi Google yang valid.'
                },
                {
                    subtitle: 'Melalui Email',
                    text: 'Anda dapat mendaftarkan email Anda untuk login Tokotitoh, dan saat Anda memasukkan email Anda. Anda akan menerima email kode verifikasi, jika kode verifikasi yang Anda masukan benar Anda akan diarahkan untuk membuat password.'
                }
            ]
        },
        {
            title: 'Edit Profil',
            items: [
                'Cara mengubah email dan nomor HP',
                'Anda dapat mengubah data tersebut.',
                'Pilih "Menu" > "Pengaturan" >',
                'Klik "Alamat Email/ID Masuk" atau "Nomor Handphone"',
                'Lalu masukkan alamat email atau nomor HP baru',
                'dan klik tombol "Ubah".'
            ],
            footer: 'Ketika mengubah email, Anda akan diminta untuk mengisi kata sandi akun Anda.\nKetika mengubah nomor HP, Anda akan diminta untuk melakukan verifikasi nomor HP baru anda'
        },
        {
            title: 'Lupa Password',
            items: [
                'Klik "Lupa Password" pada laman "Masuk/Daftar".',
                'Masukkan alamat email yang telah Anda daftarkan lalu klik tombol "Kirim".',
                'Kami akan mengirimkan link ke email Anda untuk membuat password baru.',
                'Klik tombol "Buat Password" pada email yang kami kirimkan.',
                'Masukkan password baru Anda, lalu klik tombol "Ubah Password".'
            ]
        },
        {
            title: 'Cara Pasang Iklan',
            items: [
                'Klik tombol "Sell".',
                'Pilih kategori produk yang Anda ingin jual.',
                'Isi detail iklan Anda.',
                'Tambahkan foto produk (maksimal 10 foto). Lebih banyak foto, semakin menarik iklan Anda.',
                'Pilih lokasi Anda.',
                'Isi detail alamat pick-up.',
                'Cantumkan harga.',
                'Klik pasang iklan dan iklan Anda akan langsung tayang.'
            ]
        },
        {
            title: 'Cara Beli Barang Atau Jasa',
            items: [
                'Cari iklan yg sesuai dengan keinginan Anda, bisa dengan bantuan Search ataupun Pemfilteran',
                'Cari lokasi yang sesuai',
                'Hubungi Pengiklan melalui telepon atau whatsapp',
                'Buat appointment dengan Penjual',
                'Hindari membeli tanpa COD'
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pusat Bantuan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>

                        {section.content && (
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        )}

                        {section.subsections && section.subsections.map((sub, subIndex) => (
                            <View key={subIndex} style={styles.subsection}>
                                <Text style={styles.subtitle}>{sub.subtitle}</Text>
                                <Text style={styles.subtext}>{sub.text}</Text>
                            </View>
                        ))}

                        {section.items && (
                            <View style={styles.listContainer}>
                                {section.items.map((item, itemIndex) => (
                                    <View key={itemIndex} style={styles.listItem}>
                                        <Text style={styles.listNumber}>{itemIndex + 1}. </Text>
                                        <Text style={styles.listText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {section.footer && (
                            <Text style={styles.footerText}>{section.footer}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B733F',
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    subsection: {
        marginTop: 10,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    subtext: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    listContainer: {
        marginTop: 5,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 5,
        paddingRight: 15,
    },
    listNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    listText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 10,
        lineHeight: 18,
    },
});

export default PusatBantuanScreen;
