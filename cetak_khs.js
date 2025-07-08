(function() {
    'use strict';

    function buatKHS() {
        const jendelaBaru = window.open('', '_blank');
        if (!jendelaBaru) {
            alert("GAGAL MEMBUKA TAB BARU!\n\nMohon izinkan pop-up untuk situs ini di pengaturan browser Anda, lalu jalankan kembali script ini.");
            return;
        }
        jendelaBaru.document.write('<html><head><title>Memuat KHS...</title></head><body><h2>Harap tunggu...</h2><p>Silakan isi data yang diminta di halaman AIS, lalu KHS akan muncul di sini.</p></body></html>');

        const kontainerDetail = document.querySelector('#response-detail .card');
        if (!kontainerDetail) {
            jendelaBaru.close();
            alert("Error: Detail KHS tidak ditemukan.\n\nMohon klik salah satu semester dari daftar terlebih dahulu, kemudian jalankan kembali script ini.");
            return;
        }

        const infoMahasiswa = ambilInfoMahasiswa();
        if (!infoMahasiswa) {
            jendelaBaru.close();
            console.log("Proses dibatalkan oleh pengguna.");
            return;
        }

        const dataKHS = ekstrakDataKHS();
        if (!dataKHS) {
            jendelaBaru.close();
            alert("Gagal mengekstrak data KHS. Pastikan halaman sudah dimuat dengan benar dan coba lagi.");
            return;
        }

        const htmlCetak = buatHtmlCetak(infoMahasiswa, dataKHS);

        jendelaBaru.document.open();
        jendelaBaru.document.write(htmlCetak);
        jendelaBaru.document.close();
        jendelaBaru.focus();
        console.log("KHS berhasil dibuat di tab baru. Siap untuk dicetak!");
    }

    function ambilInfoMahasiswa() {
        const namaMahasiswa = prompt("Masukkan Nama Mahasiswa:");
        if (namaMahasiswa === null) return null;
        const nimMahasiswa = prompt("Masukkan NIM:");
        if (nimMahasiswa === null) return null;
        const prodiMahasiswa = prompt("Masukkan Program Studi:");
        if (prodiMahasiswa === null) return null;

        let namaBeasiswa = '';
        const tanyaBeasiswa = prompt("Apakah mahasiswa menerima beasiswa? (Ketik 'ya' jika ya, kosongkan jika tidak):", '');
        if (tanyaBeasiswa === null) return null;

        if (tanyaBeasiswa.toLowerCase() === 'ya') {
            namaBeasiswa = prompt("Masukkan nama beasiswanya:", "KIP-Kuliah");
            if (namaBeasiswa === null) return null;
        }

        const namaPejabat = prompt("Masukkan Nama Pejabat (Wakil Dekan):", "Prof. Ir. Haviluddin, Ph.D., IPM., ASEAN Eng.");
        if (namaPejabat === null) return null;
        const nipPejabat = prompt("Masukkan NIP Pejabat:", "197305281999031001");
        if (nipPejabat === null) return null;

        return { nama: namaMahasiswa, nim: nimMahasiswa, prodi: prodiMahasiswa, beasiswa: namaBeasiswa, pejabat: namaPejabat, nip: nipPejabat };
    }

    function ekstrakDataKHS() {
        try {
            const ipSemester = document.getElementById('ip').textContent.trim();
            const ipkKumulatif = document.getElementById('ipk').textContent.trim();
            const totalSksSemester = parseFloat(document.querySelector('#response-detail table tbody tr:nth-last-child(4) td:last-child').textContent.trim());
            const totalSksKumulatif = document.getElementById('total-sks').textContent.trim();

            const daftarMataKuliah = [];
            let totalBobotSks = 0;

            const barisTabel = document.querySelectorAll('#response-detail tbody tr:not(:has(td[colspan]))');

            barisTabel.forEach((baris) => {
                const sel = baris.querySelectorAll('th, td');

                const teksMataKuliah = sel[2].innerText.trim().split('\n')[0];
                const [kodeMK, ...namaMKParts] = teksMataKuliah.split(' - ');
                const namaMK = namaMKParts.join(' - ').replace('*', '').trim();

                const sksMataKuliah = parseInt(sel[4].textContent.trim());
                const nilaiHuruf = sel[6].textContent.trim();
                const bobotNilai = parseFloat(sel[7].textContent.trim());
                const hasilBobotSks = parseFloat(sel[8].textContent.trim());

                if (!isNaN(hasilBobotSks)) {
                    totalBobotSks += hasilBobotSks;
                }

                daftarMataKuliah.push({
                    nomor: sel[0].textContent.trim(),
                    kode: kodeMK,
                    nama: namaMK,
                    wp: sel[3].textContent.trim(),
                    sks: sksMataKuliah,
                    nh: nilaiHuruf,
                    bbt: bobotNilai,
                    hasil: hasilBobotSks
                });
            });

            let namaSemester = "TIDAK DITEMUKAN";
            const itemDaftar = document.querySelectorAll('#paginated-list > li.inbox-data');
            itemDaftar.forEach(item => {
                const itemIps = item.querySelector('.badge-light-info').textContent.replace('IPS : ', '').trim();
                const itemSks = parseFloat(item.querySelector('.badge-light-success').textContent.replace('SKS : ', '').trim());
                if (itemIps === ipSemester && itemSks === totalSksSemester) {
                    namaSemester = item.querySelector('.email-data > span').textContent.trim().toUpperCase();
                }
            });

            return { ip: ipSemester, ipk: ipkKumulatif, sksSemester: totalSksSemester, sksKumulatif: totalSksKumulatif, bobotSksTotal: totalBobotSks, namaSemester: namaSemester, mataKuliah: daftarMataKuliah };
        } catch (error) {
            console.error("Terjadi kesalahan saat mengekstrak data KHS:", error);
            return null;
        }
    }

    function buatHtmlCetak(infoMahasiswa, dataKHS) {
        const buatBarisMataKuliah = () => {
            return dataKHS.mataKuliah.map(mk => `
                <tr>
                    <td align='center'>${mk.nomor}</td>
                    <td align='left'>${mk.kode}</td>
                    <td align='left'>${mk.nama}</td>
                    <td align='center'>${mk.wp}</td>
                    <td align='center'>${mk.sks}</td>
                    <td align='center'>${mk.nh}</td>
                    <td align='center'>${mk.bbt.toFixed(1).replace('.0','')}</td>
                    <td align='right'>${mk.hasil.toFixed(2)}</td>
                </tr>`).join('');
        };

        let maksimalSksSemesterBerikutnya;
        const ipFloat = parseFloat(dataKHS.ip);
        if (ipFloat >= 3.00) maksimalSksSemesterBerikutnya = 24;
        else if (ipFloat >= 2.50) maksimalSksSemesterBerikutnya = 21;
        else if (ipFloat >= 2.00) maksimalSksSemesterBerikutnya = 18;
        else if (ipFloat >= 1.50) maksimalSksSemesterBerikutnya = 15;
        else maksimalSksSemesterBerikutnya = 12;

        const hariIni = new Date();
        const tanggalSurat = `${hariIni.getDate()} ${hariIni.toLocaleString('id-ID', { month: 'long' })} ${hariIni.getFullYear()}`;

        return `
            <html><head><title>Cetak KHS - ${infoMahasiswa.nim}</title>
            <style>
                body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin: 0; padding: 0; }
                page { background: white; display: block; margin: 0 auto; padding: 2cm; }
                page[size="A4"] { width: 21cm; height: 29.7cm; box-sizing: border-box; }
                @media print { body, page { margin: 0; box-shadow: 0; } }
                .l1 { font-size: 14pt; } .l2 { font-size: 16pt; } .l3 { font-size: 12pt; }
                .lb { font-weight: bold; } .lu { text-decoration: underline; }
                .tabel-common { border-collapse: collapse; border: 1px solid black; width: 100%; }
                .tabel-common th, .tabel-common td { border: 1px solid black; padding: 4px; vertical-align: top;}
                hr { border: none; border-top: 1px solid black; }
            </style></head><body><page size="A4">
                <table width="100%"><tr>
                    <td width="100"><img src='https://sia-arsip.unmul.ac.id/public/img/logo-cetak.jpg' width='100'></td>
                    <td style="text-align: center;">
                        <font class='l2 lb'>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN</font><br>
                        <font class='l2 lb'>RISET, DAN TEKNOLOGI</font><br>
                        <font class='l2 lb'>UNIVERSITAS MULAWARMAN</font><br>
                        <font class='l1 lb'>FAKULTAS TEKNIK</font><br>
                        <span style="font-size:9pt;">Kampus Gunung Kelua, Jalan Sambaliung Nomor 9 Samarinda 75119<br>
                        Telp. (0541) 736834, Fax (0541) 749315<br>
                        Email : dekan@ft.unmul.ac.id,fteknik.unmul@ft.unmul.ac.id | Laman : http://ft.unmul.ac.id</span>
                    </td></tr>
                </table>
                <hr style="border-width: 2px; margin-top: 5px;"><hr style="margin-top: 1px; margin-bottom: 10px;">
                <div align='center'><font class='l2 lb lu'>KARTU HASIL STUDI (KHS)</font><br><font class='l3 lb'>SEMESTER ${dataKHS.namaSemester}</font></div><br>
                <table width='100%' style="font-size:11pt;">
                    <tr><td width='120px'>NAMA</td><td width='45%'>: ${infoMahasiswa.nama.toUpperCase()}</td><td width='150px'>SKS KUMULATIF</td><td>: ${dataKHS.sksKumulatif}</td></tr>
                    <tr><td>NIM</td><td>: ${infoMahasiswa.nim}</td><td>IP KUMULATIF</td><td>: ${dataKHS.ipk}</td></tr>
                    <tr><td>PROGRAM STUDI</td><td>: ${infoMahasiswa.prodi.toUpperCase()}</td></tr>
                    <tr><td>BEASISWA</td><td>: ${infoMahasiswa.beasiswa.toUpperCase() || '-'}</td></tr>
                </table><br>
                <table class='tabel-common'>
                    <thead><tr>
                        <th width='5%' align='center'>NO</th><th width='15%' align='center'>KODE MK</th>
                        <th align='center'>MATA KULIAH</th><th width='7%' align='center'>W/P</th>
                        <th width='7%' align='center'>SKS</th><th width='7%' align='center'>NILAI</th>
                        <th width='7%' align='center'>BOBOT</th><th width='10%' align='center'>HASIL</th>
                    </tr></thead>
                    <tbody>${buatBarisMataKuliah()}
                        <tr><th colspan='4' align='center'>TOTAL</th><th>${dataKHS.sksSemester.toFixed(0)}</th><th colspan='2'></th><th>${dataKHS.bobotSksTotal.toFixed(2)}</th></tr>
                        <tr><th colspan='8' align='left' style="padding: 6px;"><font class='l3 lb'>INDEKS PRESTASI (IP): ${dataKHS.ip}</font></th></tr>
                        <tr><th colspan='8' align='left' style="padding: 6px;"><font class='l3 lb'>Maksimal SKS Semester Berikutnya: ${maksimalSksSemesterBerikutnya} SKS</font></th></tr>
                    </tbody>
                </table><br><br>
                <table width='100%'>
                    <tr><td width='60%'></td><td width='40%'>Samarinda, ${tanggalSurat}</td></tr>
                    <tr><td></td><td>Wakil Dekan Bidang Akademik,</td></tr>
                    <tr><td height='80'></td><td></td></tr>
                    <tr><td></td><td><font class='lb lu'>${infoMahasiswa.pejabat}</font></td></tr>
                    <tr><td></td><td><font style="font-weight: normal;">NIP. ${infoMahasiswa.nip}</font></td></tr>
                </table>
            </page></body></html>`;
    }

    buatKHS();

})();