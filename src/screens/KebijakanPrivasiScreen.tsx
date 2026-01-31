import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const KebijakanPrivasiScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kebijakan Privasi</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.paragraph}>
                    TOKOTITOH sangat menghargai privasi Anda, Kebijakan Privasi ini merupakan komitmen dari PT LOKOH TITOH INTIATOH untuk menghargai dan melindungi setiap informasi pribadi Pengguna situs www.tokotitoh.co.id dan aplikasi Tokotitoh. Kami hanya akan mengumpulkan informasi yang diperlukan dan yang relevan dengan transaksi antara Tokotitoh dengan para Pengguna layanan dan selalu aktif berupaya untuk menjaga keamanan data pribadi Anda. Pernyataan privasi ini akan menjelaskan bagaimana kami menangani data pribadi Anda, hak privasi Anda dan menjelaskan perlindungan yang diberikan oleh hukum terhadap data Anda.
                </Text>

                <Text style={styles.paragraph}>
                    Pernyataan privasi ini berlaku untuk penggunaan atas produk, layanan, konten, fitur, teknologi, atau fungsi apa pun, dan semua situs web terkait, aplikasi seluler, situs seluler, atau properti atau aplikasi online lainnya yang kami tawarkan kepada Anda. Dengan menggunakan Pengguna dianggap telah membaca, memahami dan menyetujui pengumpulan dan penggunaan data pribadi Pengguna tokotitoh.co.id menyarankan agar anda membaca secara seksama dan memeriksa halaman Kebijakan Privasi ini dari waktu ke waktu untuk mengetahui perubahan apapun.
                </Text>

                <Text style={styles.sectionTitle}>Pengumpulan Informasi Pengguna</Text>
                <Text style={styles.paragraph}>
                    Ketika Pengguna membuat akun di website tokotitoh.co.id atau aplikasi Tokotitoh informasi Pengguna yang kami kumpulkan dapat meliputi : Nama, Email, Nomor Ponsel, Dan Lain-lain.
                </Text>

                <Text style={styles.paragraph}>
                    Saat membuat akun Pengguna harus menyerahkan informasi yang akurat, lengkap dan tidak menyesatkan. Pengguna harus tetap memperbarui dan menginformasikannya apabila ada perubahan. Kami berhak meminta dokumentasi untuk melakukan verifikasi informasi yang Pengguna berikan.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh hanya akan dapat mengumpulkan informasi pribadi Pengguna jika Pengguna secara sukarela menyerahkan informasi tersebut. Jika Pengguna memilih untuk tidak mengirimkan informasi pribadi Pengguna kepada tokotitoh atau kemudian menarik persetujuan menggunakan informasi pribadi Pengguna, maka hal itu dapat menyebabkan kami tidak dapat menyediakan layanan kepada Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh dapat menggunakan keseluruhan informasi / data Pengguna sebagai acuan untuk upaya peningkatan produk dan pelayanan.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh dapat menggunakan keseluruhan informasi / data Pengguna untuk kebutuhan transaksi tentang riset pasar, promosi Barang, penawaran khusus, maupun informasi lain, dimana Tokotitoh dapat menghubungi Pengguna melalui email, surat, telepon, sms, atau media elektronik lainnya.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh dapat menghubungi Pengguna melalui email, surat, telepon, sms, atau media elektronik lainnya termasuk namun tidak terbatas, untuk membantu dan/atau menyelesaikan proses transaksi jual-beli antar Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh mungkin menggunakan cookies dan teknologi serupa lainnya untuk menyimpan informasi sehingga memungkinkan Pengguna untuk mengakses layanan secara optimal serta meningkatkan performa layanan.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh melindungi segala informasi yang diberikan Pengguna pada saat pendaftaran, mengakses, dan menggunakan layanan Tokotitoh.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh tidak bertanggung jawab atas pertukaran data yang dilakukan sendiri di antara Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    tokotitoh.co.id dan aplikasi tokotitoh hanya dapat memberitahukan data dan informasi yang dimiliki oleh Pengguna bila diwajibkan dan/atau diminta oleh institusi yang berwenang berdasarkan ketentuan hukum yang berlaku, perintah resmi dari pengadilan, dan/atau perintah resmi dari instansi/aparat penegak hukum yang bersangkutan. Dalam hal ini Pengguna setuju untuk tidak melakukan tuntutan apapun terhadap Tokotitoh dan/atau PT Bursa Interaktif Gemilang untuk pengungkapan informasi pribadi Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh akan mengumpulkan dan mengolah data mengenai kunjungan Pengguna data lokasi, weblog, tautan ataupun data komunikasi lainnya.
                </Text>

                <Text style={styles.paragraph}>
                    Pada saat Pengguna menghubungi kami, kami menyimpan catatan mengenai korespondensi tersebut dan isi dari komunikasi antara Pengguna dan tokotitoh
                </Text>

                <Text style={styles.paragraph}>
                    Kami menggunakan nomor ponsel Anda, data log, dan pengidentifikasi perangkat unik untuk mengelola dan melindungi Layanan kami (termasuk pemecahan masalah, analisis data, pengujian, pencegahan penipuan, pemeliharaan sistem, dukungan, pelaporan, dan hosting data).
                </Text>

                <Text style={styles.sectionTitle}>Tindakan Teknis dan Organisasi & Pemrosesan Keamanan</Text>
                <Text style={styles.paragraph}>
                    Semua informasi yang kami terima tentang Anda disimpan di server aman dan kami telah menerapkan langkah-langkah teknis dan organisasi yang sesuai dan diperlukan untuk melindungi data pribadi Anda.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh terus mengevaluasi keamanan jaringannya yang dirancang untuk membantu mengamankan data Anda dari kehilangan, akses atau pengungkapan yang tidak disengaja atau melanggar hukum, mengidentifikasi risiko yang dapat diduga secara wajar terhadap keamanan jaringan , dan meminimalkan risiko keamanan, termasuk melalui penilaian risiko dan pengujian rutin.
                </Text>

                <Text style={styles.paragraph}>
                    Harap dicatat, meskipun kami telah melakukan langkah-langkah yang kami terapkan untuk melindungi data Anda, transfer data melalui Internet atau jaringan terbuka lainnya tidak pernah sepenuhnya aman dan ada risiko bahwa data pribadi Anda dapat diakses oleh pihak ketiga yang tidak sah.
                </Text>

                <Text style={styles.paragraph}>
                    Untuk keluhan perlindungan data anda dapat menggunakan hubungi kami, Tokotitoh akan melakukan penghapusan data jika Pengguna memintanya. Silahkan menghubungi pada Layanan Pelanggan kami dengan menyertakan alamat email dan nama Pengguna.
                </Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#000',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
        color: '#000',
    },
    paragraph: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 16,
    },
});

export default KebijakanPrivasiScreen;
