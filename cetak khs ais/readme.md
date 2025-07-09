# Skrip Cetak KHS Otomatis (Fakultas Teknik - AIS Unmul)

Skrip ini dirancang untuk membantu mahasiswa **Fakultas Teknik Universitas Mulawarman** mencetak **Kartu Hasil Studi (KHS)** dari portal AIS secara otomatis. Skrip ini mengambil data KHS, memformatnya, dan menghasilkan dokumen siap cetak dalam format PDF atau langsung ke printer.

## Fitur Utama
- **Otomatisasi**: Mengambil data KHS langsung dari halaman AIS dan memformatnya secara otomatis.
- **Versi Cetak**: Menghasilkan KHS dalam format rapi, siap cetak, atau disimpan sebagai PDF.

## Catatan Penting
- **Khusus Fakultas Teknik**: Skrip ini hanya diuji untuk Fakultas Teknik di portal AIS Unmul. Format masih perlu disesuaikan dengan prodi fakultas lain.
- **Pembaruan Berkelanjutan**: Skrip ini masih dalam pengembangan. Pantau pembaruan untuk fitur tambahan atau kompatibilitas yang lebih luas.

## Requirements
- Browser (Google Chrome, Microsoft Edge, atau semacamnya).
- Akses ke portal AIS Universitas Mulawarman ( [AIS Unmul](https://ais.unmul.ac.id) ).
- Pop-up harus diizinkan di browser untuk membuka tab baru saat mencetak.

## Cara Pakai
Ikuti langkah-langkah berikut untuk menggunakan skrip ini:

1. **Buka Halaman KHS di AIS**:
   - Masuk ke akun mahasiswa Anda di [AIS Unmul](https://ais.unmul.ac.id/mahasiswa/khs).
   - Pastikan Anda berada di halaman KHS.

2. **Buka Console Developer**:
   - **Chrome/Edge**: Tekan `F12` atau klik kanan pada halaman, lalu pilih **Inspect** > tab **Console**.
   - **Firefox**: Tekan `F12` atau klik kanan pada halaman, lalu pilih **Inspect Element** > tab **Console**.

3. **Salin dan Tempel Skrip**:
   - Salin kode JavaScript dari file [`cetak_khs.js`](cetak_khs_fakultas_teknik.js) di repositori ini.
   - Tempelkan kode ke dalam tab **Console** di browser.

4. **Jalankan Skrip**:
   - Tekan `Enter` setelah menempelkan kode.
   - Skrip akan menampilkan daftar semester yang tersedia. Masukkan nomor semester yang diinginkan, lalu tekan `Enter`.

5. **Ikuti Instruksi**:
   - Pilih apakah ingin membuat versi cetak KHS:
     - Tekan **OK** untuk membuat versi cetak.
     - Tekan **Batal** untuk hanya melihat detail KHS di halaman AIS.
   - Jika memilih versi cetak, masukkan informasi berikut:
     - Nama Lengkap
     - NIM
     - Program Studi
     - Nama Beasiswa (jika ada, atau kosongkan)
     - Nama Wakil Dekan
     - NIP Wakil Dekan

6. **Konfigurasi Cetak**:
   - Setelah memilih versi cetak, skrip akan membuka tab baru dengan KHS yang sudah diformat.
   - Dialog cetak browser akan muncul secara otomatis. Pastikan settingan cetak sebagai berikut:
     - **Pages**: All
     - **Layout**: Portrait
     - **Paper Size**: A5
     - **Pages per Sheet**: 1
     - **Margins**: Default
     - **Scale**: Custom, set ke `88`
     - **Headers and Footers**: Tidak dicentang ❌
     - **Background Graphics**: Dicentang ✅
   - Contoh settingan cetak:  
     ![Settingan Cetak](https://cdn.discordapp.com/attachments/1372924635129188394/1392380735595352064/80b9132b-9524-4007-8849-76e6d1274c1c.png?ex=686f531c&is=686e019c&hm=8092c29516919db9e447489003daa464e04d0b9faadee2471e0294a190154d14&)

7. **Cetak atau Simpan**:
   - Tekan **Save** untuk menyimpan sebagai PDF atau **Print** untuk mencetak langsung.

## Contoh Hasil Cetak
Berikut adalah tampilan KHS yang dihasilkan oleh skrip:  
![Contoh KHS](https://media.discordapp.net/attachments/1372924635129188394/1392380924171124736/10190B1D-6E1E-4DA6-889A-B83418D6E910.png?ex=686f5349&is=686e01c9&hm=f9b92e8c85b3fc94f874db42a703f32435b508d7c50fc56b92832a48fe2e1d53&=&format=webp&quality=lossless&width=654&height=925)