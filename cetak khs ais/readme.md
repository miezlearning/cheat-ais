# Skrip Cetak KHS Otomatis (AIS Unmul)

Skrip ini dibuat untuk memudahkan mahasiswa dalam mencetak **Kartu Hasil Studi (KHS)** dari portal AIS Universitas Mulawarman secara otomatis. Dengan skrip ini, data KHS diambil langsung dari portal, diformat, dan dihasilkan dalam dokumen yang siap dicetak atau disimpan sebagai PDF.

# Video Tutorial (Coming Soon)

## Fitur Utama
- **Otomatisasi**: Mengambil data KHS langsung dari halaman AIS dan memformatnya secara otomatis.
- **Versi Cetak**: Menghasilkan KHS dalam format rapi, siap cetak, atau disimpan sebagai PDF.

## Catatan Penting
- **Bisa Digunakan Semua Fakultas**: Skrip ini sekarang sudah dapat digunakan untuk seluruh fakultas di portal AIS Unmul. Format KHS akan menyesuaikan dengan data dari masing-masing fakultas.
- **Pembaruan Berkelanjutan**: Skrip ini masih dalam pengembangan. Pantau pembaruan untuk fitur tambahan atau peningkatan kompatibilitas.

## Requirements
- Browser (Google Chrome, Microsoft Edge, atau semacamnya).
- Akses ke portal AIS Universitas Mulawarman ( [AIS Unmul](https://ais.unmul.ac.id) ).
- Pop-up harus diizinkan di browser untuk membuka tab baru saat mencetak.


## Cara Pakai (Update)
Ikuti langkah-langkah berikut untuk menggunakan skrip ini:

1. **Buka Halaman KHS di AIS**
   - Login ke [AIS Unmul](https://ais.unmul.ac.id/mahasiswa/khs).
   - Pastikan Anda berada di halaman KHS.

2. **Buka Console Developer**
   - Tekan `F12` atau klik kanan > **Inspect** > tab **Console**.

3. **Salin dan Tempel Skrip**
   - Salin kode dari file [`cetak_khs_fakultas_teknik.js`](cetak_khs_fakultas_teknik.js).
   - Tempelkan ke tab **Console** di browser.

4. **Jalankan Skrip**
   - Tekan `Enter` setelah menempelkan kode.
   - Pilih semester yang ingin dicetak dengan memasukkan nomor semester.

5. **Pilih Mode Cetak**
   - Tekan **OK** untuk membuat versi cetak KHS (tab baru akan terbuka).
   - Tekan **Batal** untuk hanya melihat detail KHS di halaman AIS.

6. **Isi Data**
   - Jika memilih versi cetak, masukkan data berikut saat diminta:
     - Nama Lengkap
     - NIM
     - Program Studi
     - Nama Fakultas
     - Nama Beasiswa (jika ada, atau kosongkan)
     - Nama Wakil Dekan
     - NIP Wakil Dekan

7. **Konfigurasi Cetak**
   - Tab baru akan terbuka dengan tampilan KHS siap cetak.
   - Atur settingan cetak browser sesuai instruksi (A5, Portrait, Scale 88, dll).
   - Contoh settingan cetak:  
     ![Settingan Cetak](https://cdn.discordapp.com/attachments/1372924635129188394/1392380735595352064/80b9132b-9524-4007-8849-76e6d1274c1c.png?ex=686f531c&is=686e019c&hm=8092c29516919db9e447489003daa464e04d0b9faadee2471e0294a190154d14&)

8. **Cetak atau Simpan**
   - Tekan **Save** untuk PDF atau **Print** untuk mencetak langsung.

## Contoh Hasil Cetak
Berikut adalah tampilan KHS yang dihasilkan oleh skrip:  
![Contoh KHS](https://media.discordapp.net/attachments/1372924635129188394/1392380924171124736/10190B1D-6E1E-4DA6-889A-B83418D6E910.png?ex=686f5349&is=686e01c9&hm=f9b92e8c85b3fc94f874db42a703f32435b508d7c50fc56b92832a48fe2e1d53&=&format=webp&quality=lossless&width=654&height=925)