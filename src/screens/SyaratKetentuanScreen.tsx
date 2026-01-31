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

const SyaratKetentuanScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Syarat Dan Ketentuan Umum</Text>

                <Text style={styles.paragraph}>
                    PT LOKOH TITOH INTIATOH adalah suatu perseroan terbatas yang didirikan menurut hukum Indonesia yang menjalankan kegiatan usaha jasa website portal www.tokotitoh.co.id dan / atau aplikasi Tokotitoh yakni situs dan aplikasi mobile jasa penghubung antara Pembeli dan Penjual. Tokotitoh dapat setiap saat, melakukan koreksi, penambahan, perbaikan, atau modifikasi pada konten, presentasi, informasi, layanan, area, basis data, dan elemen lain dari Layanan tersebut, tanpa hal ini tidak menimbulkan hak atas klaim atau kompensasi apa pun, juga tidak menyatakan pengakuan atas tanggung jawab apapun yang menguntungkan Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh berhak untuk mengubah Syarat dan Ketentuan ini setiap saat. Dengan cara ini, Pengguna setuju untuk meninjau ketentuan ini secara berkala untuk mengikuti perubahan tersebut. Setiap kali pengguna mengakses layanan, itu akan dianggap sebagai penerimaan mutlak atas perubahan Syarat dan Ketentuan ini. Dalam hal Pengguna tidak setuju dengan salah satu Ketentuan, pedoman apa pun atau salah satu perubahannya; atau, tidak puas dengan Tokotitoh karena alasan apapun, Pengguna dapat segera berhenti menggunakan Tokotitoh para pengguna baik pembeli dan penjual diwajibkan untuk waspada terhadap penipuan baik itu dari kualitas barang atau pun kehilangan total segala kerugian yg ada antara penjual dan pembeli bukan tanggung jawab dari Tokotitoh atau PT LOKOH TITOH INTIATOH Layanan hanya tersedia untuk orang yang memiliki kapasitas hukum untuk membuat kontrak. Orang yang tidak memiliki kapasitas tersebut, anak di bawah umur atau Pengguna yang telah ditangguhkan sementara atau dinonaktifkan secara permanen tidak boleh menggunakan layanan.
                </Text>

                <Text style={styles.paragraph}>
                    Syarat & Ketentuan yang di bawah ini mengatur pemakaian jasa yang ditawarkan oleh PT LOKOH TITOH INTIATOH dalam penggunaan situs www.tokotitoh.co.id dan / atau aplikasi Tokotitoh. Pengguna diwajibkan membaca dengan seksama karena syarat & ketentuan ini berdampak kepada hak dan kewajiban masing-masing Pengguna berdasarkan hukum.
                </Text>

                <Text style={styles.paragraph}>
                    Syarat & Ketentuan merupakan perjanjian antara masing- masing Pengguna dan PT LOKOH TITOH INTIATOH yang berisikan seperangkat kesepakatan yang mengatur hak, kewajiban, tanggung jawab masing-masing Pengguna dan PT Bursa Interaktif Gemilang, serta tata cara penggunaan sistem layanan Pengguna adalah masing-masing subjek hukum yang menggunakan layanan termasuk namun tidak terbatas pada Pembeli, Penjual maupun pihak lain yang sekedar berkunjung ke Tokotitoh
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh tidak bertanggung jawab atas kebenaran informasi, gambar dan keterangan, Anda disarankan untuk berhubungan langsung dengan pemasang iklan untuk memastikan informasi yang dicari.
                </Text>

                <Text style={styles.paragraph}>
                    Setiap informasi yang dibuat oleh pemasang iklan atau terhadap layanan atau produknya. Tanggung jawab isi dan/atau materi iklan yang dipasang oleh pemasang iklan (“Materi”) merupakan tanggung jawab sepenuhnya dari pemasang iklan. Tokotitoh tidak memiliki hak milik atas iklan yang dipasang oleh pengguna, maupun terlibat dalam proses kesepakatan, pembayaran, pengiriman serta proses purna jual di antara penjual dan pembeli. Perikatan untuk penyerahan barang atau jasa yang terjadi melalui Layanan atau sebagai hasil dari kunjungan dan keberhasilan penawaran yang diajukan oleh pengguna dibuat dengan bebas antara penjual dan pembeli.Informasi, gambar dan keterangan lainnya yang terdapat atau diterbitkan dalam Situs ini juga dapat mengandung ketidakakuratan Para pemasang iklan mungkin akan melakukan perubahan atau perbaikan, dan/atau memperbarui informasi yang tertera di dalam Situs dari waktu ke waktu. Tokotitoh Indonesia tidak menanggung kewajiban untuk memperbarui Materi yang telah menjadi kedaluwarsa atau tidak akurat.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh tanpa pemberitahuan terlebih dahulu kepada Pengguna, memiliki kewenangan untuk melakukan tindakan yang perlu atas setiap dugaan pelanggaran atau pelanggaran Syarat & Ketentuan dan/atau hukum yang berlaku.
                </Text>

                <Text style={styles.paragraph}>
                    Pengguna bertanggung jawab secara pribadi untuk menjaga kerahasiaan akun dan password untuk semua aktivitas yang terjadi dalam akun Pengguna. Tokotitoh tidak akan meminta password akun Pengguna untuk alasan apapun, oleh karena itu menghimbau Pengguna agar tidak memberikan password akun Anda kepada pihak manapun. Pengguna dilarang untuk menciptakan dan/atau menggunakan perangkat, software, fitur dan/atau alat lainnya yang bertujuan untuk melakukan manipulasi pada sistem Tokotitoh. Pengguna juga dilarang mengirimkan e-mail spam dengan merujuk ke bagian apapun dari Tokotitoh.
                </Text>

                <Text style={styles.paragraph}>
                    Pengguna menjamin bahwa tidak melanggar hak kekayaan intelektual dalam mengunggah konten Pengguna kedalam Tokotitoh. Setiap Pengguna dengan ini bertanggung jawab secara pribadi atas pelanggaran hak kekayaan intelektual dalam mengunggah konten. Pengguna setuju untuk selalu mengakses dan/atau menggunakan Tokotitoh hanya untuk tujuan yang tidak melanggar hukum, dan dengan cara yang sah dan selanjutnya setuju untuk melakukan kegiatan yang berkaitan dengan itikad baik. Pengguna setuju untuk selalu memastikan bahwa setiap informasi atau data yang Pengguna berikan/masukkan adalah akurat dan setuju untuk bertanggung jawab atas informasi dan data tersebut.
                </Text>

                <Text style={styles.paragraph}>
                    Pengguna dengan ini menyatakan bahwa Tokotitoh tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penyalahgunaan akun Pengguna.
                </Text>

                <Text style={styles.paragraph}>
                    Pengguna tidak diperbolehkan menggunakan layanan untuk melanggar peraturan yang ditetapkan oleh hukum di Indonesia.
                </Text>

                <Text style={styles.paragraph}>
                    Pengguna dilarang keras menyampaikan setiap jenis konten apapun yang menyesatkan, memfitnah, atau mencemarkan nama baik, mengandung atau bersinggungan dengan unsur SARA, diskriminasi, melanggar peraturan terkait perlindungan Hak Kekayaan Intelektual dan/atau menyudutkan pihak lain. Tokotitoh tidak bertanggung jawab atas akibat langsung atau tidak langsung dari keputusan Pengguna / Pembeli dalam mengajukan penawaran atau tidak mengajukan penawaran kepada pemasang iklan, melakukan jual beli atau tidak melakukan jual beli dengan pemasang iklan. Pengguna memahami dan menyetujui bahwa penggunaan dan pelaksanaan kegiatan sehubungan di Tokotitoh adalah atas kebijakan dan risiko Pengguna sendiri.
                </Text>

                <Text style={styles.sectionTitle}>Titip Jual (Consignment)</Text>
                <Text style={styles.paragraph}>
                    Pembeli bertanggung jawab untuk membaca, memahami, dan menyetujui informasi / deskripsi sebelum membuat tawaran atau komitmen untuk membeli, dimana informasi / deskripsi yang disediakan tersebut tidak dijamin 100% akurat dan hanya aproksimasi. Segala kerugian yg ada antara penjual dan pembeli bukan tanggung jawab dari Tokotitoh atau PT LOKOH TITOH INTIATOH.
                </Text>

                <Text style={styles.sectionTitle}>Larangan Beriklan</Text>
                <Text style={styles.paragraph}>
                    Untuk menjaga kualitas layanan dan ketertiban terhadap hukum Indonesia, kepuasan Pengguna, serta pengalaman Pengguna (User Experience), daftar barang dan jasa ini adalah bagian yang tidak terpisah dari Syarat dan Ketentuan. Berikut daftar barang dan jasa yang dilarang dijual di tokotitoh.co.id dan aplikasi Tokotitoh
                </Text>

                <Text style={styles.subSectionTitle}>Kebiakan Khusus Selama Pandemi COVID-19</Text>
                <Text style={styles.paragraph}>
                    Berikut daftar iklan / produk yang dilarang tayang selama pandemi COVID-19 :
                </Text>
                <Text style={styles.listItem}>• Surat Bebas COVID-19</Text>
                <Text style={styles.listItem}>• Alat Pelindung Diri (APD) Baju Hazmat</Text>
                <Text style={styles.listItem}>• Alat Rapid Test COVID-19</Text>
                <Text style={styles.listItem}>• Alat Swab PCR Test COVID-19</Text>
                <Text style={styles.listItem}>• Tanah Pemakaman COVID-19 dan jasanya</Text>

                <Text style={styles.sectionTitle}>Umum</Text>
                <Text style={styles.paragraph}>
                    Barang atau jasa yang tergolong berbahaya, melanggar hukum, mengancam, melecehkan, menghina,memfitnah, mengintimidasi, menginvasi privasi orang lain atau hak-hak lainnya, meremehkan, berkaitan atau dengan cara apapun atau melanggar hukum dengan cara apapun tidak dapat ditayangkan.
                </Text>
                <Text style={styles.paragraph}>
                    Iklan yang masuk dalam kategori ini termasuk, antara lain :
                </Text>
                <Text style={styles.listItem}>• Iklan yang merugikan pihak ketiga dalam bentuk apapun</Text>
                <Text style={styles.listItem}>• Benda-benda atau jasa yang tergolong sensitif dan salah secara moral.</Text>
                <Text style={styles.listItem}>• Barang hasil kejahatan demi terbentuk nya aplikasi dan website yg terbaik kami melarang penayangan iklan sbb :</Text>
                <Text style={styles.subListItem}>   - Iklan yang menduplikasi iklan lain yang sudah aktif</Text>
                <Text style={styles.subListItem}>   - Iklan yang mengarahkan ke platform, situs, jasa, atau kantor pesaing</Text>
                <Text style={styles.subListItem}>   - Iklan dengan kategori yang tidak sesuai</Text>
                <Text style={styles.subListItem}>   - Iklan dengan foto buram, terbalik, atau bermutu jelek</Text>
                <Text style={styles.subListItem}>   - Iklan dengan foto, deskripsi, dan/atau judul yang tidak sesuai dengan produk/jasa yang dijual.</Text>

                <Text style={styles.sectionTitle}>Iklan Dengan Materi Dewasa</Text>
                <Text style={styles.paragraph}>
                    Melarang iklan yang mengandung pornografi, bersifat dewasa, atau materi yang hanya bisa dikonsumsi oleh orang dewasa, seperti :
                </Text>
                <Text style={styles.paragraph}>
                    Benda atau gambar yang mengandung pornografi secara terang-terangan, terutama yang menampilkan jenis kelamin pria/wanita dan/atau pornografi yang melibatkan orang-orang dibawah usia dewasa. Benda-benda terkait dengan kekerasan seksual. Alat bantu seks, vibrator, obat seks, obat kuat, enlargement pill (obat pembesar kelamin), perangsang, Jasa lady escort/companion, atau wanita sewaan. Jasa seks komersial. Iklan-iklan yang cabul, atau bersifat atau bahkan secara implisit maupun eksplisit merupakan pornografi
                </Text>

                <Text style={styles.sectionTitle}>Iklan yang Merugikan Pihak / Kelompok Tertentu</Text>
                <Text style={styles.paragraph}>
                    melarang pengguna untuk mengunggah materi yang bersifat melecehkan atau intimidasi, atau yang menghasut kebencian atau mempromosikan kekerasan terhadap individu atau kelompok berdasarkan ras atau asal etnis, agama, kecacatan, jenis kelamin, usia, status veteran, atau orientasi seksual/identitas gender ataupun menghasut atau untuk mendukung bahaya terhadap individu atau kelompok, antara lain :
                </Text>
                <Text style={styles.paragraph}>
                    Benda atau gambar atau jasa yang yang melecehkan, mendegradasi, atau mengandung muatan kebencian terhadap individu atau kelompok individu atas dasar agama, jenis kelamin, orientasi seksual, ras, etnis, usia, atau cacat tubuh. Iklan yang menganjurkan /membenarkan kekerasan atau membuat ancaman bahaya terhadap individu atau kelompok. Iklan yang menghasut atau mempromosikan kebencian terhadap kelompok atau individu. Iklan yang mendorong orang lain untuk percaya bahwa suatu kelompok atau individu adalah tidak manusiawi atau lebih rendah. Iklan yang menyerang seseorang atau kelompok atas dasar orientasi seksual atau identitas gender.
                </Text>

                <Text style={styles.sectionTitle}>Iklan yang Melanggar Hak Kekayaan Intelektual Atau Hak Pihak Ketiga</Text>
                <Text style={styles.paragraph}>
                    Termasuk dalam kategori ini adalah iklan-iklan seperti :
                </Text>
                <Text style={styles.paragraph}>
                    Barang-barang yang melanggar hak kekayaan intelektual pihak ketiga, termasuk namun tidak terbatas pada : Barang black market/illegal, Barang palsu/”KW”, Barang imitasi, Copy dari original, Barang replika, Musik, film, software, dan barang-barang lain yang melanggar hak kekayaan intelektual. Akun digital termasuk username, email, password (kode identifikasi pengguna), PIN, dst. Iklan yang mencakup informasi pribadi atau identifikasi tentang orang lain tanpa persetujuan eksplisit orang itu. Iklan produk yang tidak diizinkan oleh Produsen atau Distributor resmi untuk diperdagangkan melalui internet.
                </Text>

                <Text style={styles.sectionTitle}>Iklan Narkoba, Obat-obatan, Makanan, Da Minuman Tertentu</Text>
                <Text style={styles.paragraph}>
                    Termasuk dalam kategori ini adalah iklan-iklan, seperti misalnya :
                </Text>
                <Text style={styles.paragraph}>
                    Obat-obatan terlarang sebagaimana diatur dalam Undang-Undang Nomor 35 Tahun 2009 Tentang Narkotika, termasuk Psikotropika dan obat-obatan, terutama obat-obatan, dan zat lain yang dimaksudkan untuk digunakan sebagai pengganti, terlepas dari apakah kepemilikan dan pemasaran zat dan bahan kimia tersebut dilarang oleh hukum atau tidak.
                </Text>
                <Text style={styles.paragraph}>
                    Obat-obatan yang berkhasiat untuk menyembuhkan penyakit kanker, tuberkulosis, poliomyelitis, penyakit kelamin, impotensi, tipus, kolera, tekanan darah tinggi, diabetes, liver dan penyakit lain yang ditetapkan oleh Keputusan Menteri Kesehatan RI 386 /MENKES /SK /IV /1994 tentang pedoman periklanan : obat bebas, obat tradisional, alat kesehatan, kosmetika, perbekalan kesehatan rumah tangga dan makanan-minuman. Obat-obat yang memerlukan resep atau tindakan langsung oleh dokter, obat bius dan sejenisnya. Obat Keras. Obat-obatan (termasuk obat-obatan tradisional) yang tidak mempunyai izin edar dan/atau yang materi iklannya belum/tidak disetujui oleh pihak-pihak terkait. Makanan, minuman dan obat-obatan yang belum terdaftar/dilarang oleh BPOM.
                </Text>

                <Text style={styles.sectionTitle}>Iklan Dengan Materi Kekerasan</Text>
                <Text style={styles.paragraph}>
                    penayangan iklan dengan gambar grafis atau berdarah seperti pertumpahan darah dan kecelakaan, seperti : Organ tubuh manusia, darah. Barang ataupun jasa terkait dengan penyiksaan baik hewan maupun manusia.
                </Text>

                <Text style={styles.sectionTitle}>Iklan Senjata, Militer, Dan Peledak</Text>
                <Text style={styles.paragraph}>
                    Iklan yang menjual, memfasilitasi atau mendukung penjualan senjata dan aksesoris senjata (kecuali aksesoris airsoftgun & aksesoris paintball) termasuk namun tidak terbatas penjualan amunisi, bagian senjata, pistol, senapan, senjata udara, dan senjata bius. Kebijakan ini juga melarang iklan yang menjual bahan peledak, termasuk produk-produk yang berhubungan dengan militer, seperti :
                </Text>
                <Text style={styles.paragraph}>
                    Senjata (termasuk senjata api, senapan angin dan benda yang mirip/sejenisnya). Tanda kepangkatan. Atribut instansi pemerintah (Polri, TNI, Dishub, dan sejenisnya).
                </Text>

                <Text style={styles.sectionTitle}>Iklan yang Memungkinkan Perilaku Penipuan Atau Tidak Jujur</Text>
                <Text style={styles.paragraph}>
                    Kami tidak mengizinkan iklan dengan materi yang mendorong atau memfasilitasi aktivitas kecurangan, penyesatan, atau penipuan seperti :
                </Text>
                <Text style={styles.paragraph}>
                    Iklan yang bertujuan untuk penipuan dan/atau mendukung penipuan. Pencucian uang. Jasa pemalsuan dokumen, jual ijazah, jual sertifikat. Skema piramida, multi-level marketing, pemasaran afiliasi atau money game. STNK dan atau BPKB yang dijual tidak bersamaan dengan kendaraan yang dimaksud dalam STNK dan atau BPKB tersebut. Penipuan jasa dan lowongan kerja.
                </Text>

                <Text style={styles.sectionTitle}>Lain-lain</Text>
                <Text style={styles.paragraph}>
                    Selain hal-hal di atas, pengguna Tokotitoh juga dilarang untuk mengiklankan (antara-lain):
                </Text>
                <Text style={styles.paragraph}>
                    Barang hasil tindak pencurian. ASI (Air Susu Ibu). Penawaran jasa pijat. Manusia (human trafficking). Barang baru yang tergolong wajib memiliki SNI, namun tidak memiliki SNI. Tanaman & binatang yang dilindungi oleh Negara berdasarkan Undang Undang NOMOR P.26 /MENLHK /SETJEN /KUM.1 /7 /2018 Tentang Konservasi Sumberdaya Alam Hayati dan Ekosistemnya. Termasuk bagian tubuh dari tanaman & binatang tersebut, seperti taring, cakar, kulit, hasil awetan, dll. Benda-benda atau jasa yang berhubungan dengan perjudian, lotre dan taruhan. Bahan kimia, beracun dan berbahaya, seperti misalnya: sulfuric acid, carbide (karbit). Iklan pencarian kerja dan penyedia kerja untuk anak di bawah umur 18 tahun.
                </Text>

                <Text style={styles.paragraph}>
                    Tokotitoh berhak untuk memutuskan dan memilih iklan yang ditayangkan dan mencabut iklan kapan saja, tanpa pemberitahuan kepada pengguna, dan secara sepihak. Kebijakan ini dapat berubah sewaktu-waktu.
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        color: '#000',
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#000',
    },
    paragraph: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    listItem: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
        paddingLeft: 8,
    },
    subListItem: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
        paddingLeft: 16,
    },
});

export default SyaratKetentuanScreen;
