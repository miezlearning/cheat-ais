(async () => {
    console.clear();
    console.log("🚀 Skrip Cetak KHS Otomatis...... DIMULAI!!");

    const semesterElements = document.querySelectorAll('li.lihat');
    if (semesterElements.length === 0) {
        console.error("❌ Gagal menemukan daftar semester. Pastikan kamu berada di halaman yang benar.");
        return;
    }
    const semesters = Array.from(semesterElements).map(el => ({
        nama: el.querySelector('div.email-data > span').innerText.trim(),
        element: el,
    }));

    let menuText = "Pilih semester yang ingin kamu lihat detailnya:\n\n";
    semesters.forEach((s, i) => menuText += `${i + 1}. ${s.nama}\n`);
    const choice = prompt(menuText);
    if (choice === null) {
        console.log("ℹ️ Oke, kamu membatalkan operasi.");
        return;
    }
    const choiceIndex = parseInt(choice, 10) - 1;
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= semesters.length) {
        alert("❌ Pilihanmu tidak valid, coba lagi ya.");
        return;
    }
    const selectedSemester = semesters[choiceIndex];

    if (confirm(`Detail KHS untuk semester ${selectedSemester.nama} akan ditampilkan di halaman ini.\n\n--> Tekan 'OK' jika kamu juga ingin membuat versi CETAK.\n--> Tekan 'Batal' jika kamu hanya ingin melihatnya di halaman ini saja.`)) {
        const newWindow = window.open('', '_blank');
        if (!newWindow) {
            alert("❌ Gagal membuka tab baru. Mohon izinkan pop-up untuk situs ini dan jalankan skrip lagi.");
            return;
        }
        newWindow.document.write('<h1>Sedang memuat data KHS, mohon tunggu sebentar...</h1>');
        console.log("✅ Tab baru berhasil dibuka. Meminta data detail KHS...");

        const studentName = prompt("Masukkan Nama Lengkap kamu:", "MUHAMMAD ALIF");
        const studentNim = prompt("Masukkan NIM kamu:", "2209106127");
        const studentProdi = prompt("Masukkan Program Studi kamu:", "S1 - INFORMATIKA");
        const fakultas = prompt("Masukkan Nama Fakultas:", "Teknik"); // Input untuk Fakultas
        // Email Fakultas tidak lagi diminta karena bagian header akan dihapus
        // const emailFakultas = prompt("Masukkan Email Fakultas:", "dekan@ft.unmul.ac.id"); // Input untuk Email Fakultas
        
        let beasiswaText = '-';
        if (confirm("Apakah kamu menerima beasiswa?")) {
            const beasiswaName = prompt("Masukkan nama beasiswanya:");
            if (beasiswaName && beasiswaName.trim()) {
                beasiswaText = beasiswaName.trim();
            }
        }

        const wakilDekanName = prompt("Masukkan Nama Wakil Dekan:", "Ir. Fahrizal Adnan, S. T., M. Sc.");
        const wakilDekanNip = prompt("Masukkan NIP Wakil Dekan:", "198807262019031010");

        // Validasi sekarang hanya mencakup studentName, studentNim, studentProdi, fakultas, wakilDekanName, wakilDekanNip
        if (!studentName || !studentNim || !studentProdi || !fakultas || !wakilDekanName || !wakilDekanNip) {
            newWindow.close();
            alert("❌ Data yang kamu masukkan tidak lengkap. Operasi dibatalkan.");
            return;
        }

        selectedSemester.element.click();
        console.log(`✅ Aksi klik pada semester "${selectedSemester.nama}" telah disimulasikan. Menunggu data muncul...`);
        
        // Panggil waitForDataAndPrint dengan parameter yang diperbarui (tanpa emailFakultas)
        waitForDataAndPrint(newWindow, studentName, studentNim, studentProdi, fakultas, beasiswaText, wakilDekanName, wakilDekanNip, selectedSemester);

    } else {
        selectedSemester.element.click();
        console.log(`✅ Aksi klik pada semester "${selectedSemester.nama}" telah disimulasikan.`);
        console.log("👇 Detail KHS kamu akan muncul di bawah di halaman ini. Silakan gulir ke bawah.");
    }

    // Di sini, parameter emailFakultas dihapus dari definisi fungsi
    function waitForDataAndPrint(printWindow, name, nim, prodi, fakultas, beasiswa, dekan, nip, semester) {
        let attempts = 0;
        const maxAttempts = 50; 
        const interval = setInterval(() => {
            const detailContainer = document.querySelector('#response-detail');
            const tableExists = detailContainer && detailContainer.querySelector('table');
            
            if (tableExists) {
                clearInterval(interval);
                console.log("✅ Data KHS terdeteksi di halaman. Sekarang sedang diproses untuk dicetak...");
                generatePrintableVersion(printWindow, name, nim, prodi, fakultas, beasiswa, dekan, nip, semester);
            } else {
                attempts++;
                if (attempts > maxAttempts) {
                    clearInterval(interval);
                    printWindow.document.write('<h1>Gagal memuat data KHS. Waktu tunggu habis.</h1><p>Mungkin koneksi internet kamu lambat atau ada masalah di halaman.</p>');
                    alert("Gagal mendeteksi detail KHS. Coba jalankan skrip lagi nanti ya.");
                }
            }
        }, 200); 
    }
    
    function generatePrintableVersion(printWindow, studentName, studentNim, studentProdi, fakultas, beasiswaText, wakilDekanName, wakilDekanNip, selectedSemester) {
        const detailContainer = document.querySelector('#response-detail');
        let courseRowsHTML = ''; 
        let totalSks = 0; 
        let totalHasil = 0;
        const apiRows = detailContainer.querySelectorAll('tbody > tr');
        let counter = 1;
        
        apiRows.forEach(row => {
            if (row.querySelector('input.list-id-kelas')) {
                const cells = row.querySelectorAll('th, td');
                const mainLine = cells[2].innerText.split('\n')[0].trim();
                let kodeMk = 'N/A'; 
                let namaMk = '';
                
                if (mainLine.includes(' - ')) {
                    const parts = mainLine.split(' - ');
                    kodeMk = parts.shift(); 
                    namaMk = parts.join(' - '); 
                } else { 
                    namaMk = mainLine; 
                }
                
                const wp = cells[3].innerText.trim(); 
                const sks = parseFloat(cells[4].innerText.trim()) || 0;
                const nh_nilai = cells[6].innerText.trim() || '-'; 
                const bbt_bobot = cells[7].innerText.trim() || '-';
                const sks_x_bbt_hasil_str = cells[8].innerText.trim().replace(',', '.');
                const sks_x_bbt_hasil = parseFloat(sks_x_bbt_hasil_str) || 0.00;

                totalSks += sks; 
                totalHasil += sks_x_bbt_hasil;
                
                courseRowsHTML += `<tr>
                                        <td align='center'>${counter++}</td>
                                        <td>${kodeMk.trim()}</td>
                                        <td>${namaMk.trim()}</td>
                                        <td align='center'>${wp}</td>
                                        <td align='center'>${sks.toFixed(2)}</td>
                                        <td align='center'>${nh_nilai}</td>
                                        <td align='center'>${bbt_bobot}</td>
                                        <td align='right'>${sks_x_bbt_hasil.toFixed(2)}</td>
                                    </tr>`;
            }
        });

        const summary = { ip: document.querySelector('#ip')?.innerText.trim() ?? '0.00' };

        const ipValue = parseFloat(summary.ip.replace(',', '.')); 
        let maksimalSksTeks = '';

        if (ipValue >= 3.00) {
            maksimalSksTeks = '24 sks';
        } else if (ipValue >= 2.50) {
            maksimalSksTeks = '21 sks';
        } else if (ipValue >= 2.00) {
            maksimalSksTeks = '18 sks';
        } else if (ipValue >= 1.50) {
            maksimalSksTeks = '15 sks';
        } else {
            maksimalSksTeks = '12 sks';
        }
        
        const getFormattedDate = () => { 
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]; 
            const today = new Date(); 
            return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`; 
        };
        
        const finalHTML = `<html>
                                <head>
                                    <title>Cetak KHS - ${studentName} - ${selectedSemester.nama.replace('/', '-')}</title>
                                    <link rel='stylesheet' type='text/css' media='all' href='https://sia-arsip.unmul.ac.id/public/css/a_sia_cetak_media_print.css' />
                                    <style>
                                        body { font-family: 'Times New Roman', Times, serif; background-color: #fff; margin: 0; padding: 0; }
                                        .tabel-common th, .tabel-common td { padding: 4px 6px; vertical-align: top; }
                                        .lu { text-transform: uppercase; }
                                        .l1 { font-size: 1.4em; }
                                        .l2 { font-size: 1.2em; }
                                        .l3 { font-size: 1.1em; }
                                        .lb { font-weight: bold; }
                                    </style>
                                </head>
                                <body>
                                    <page>
                                        <table>
                                            <tr>
                                                <td><img src='https://sia-arsip.unmul.ac.id/public/img/logo-cetak.jpg' width='100' alt='Logo Unmul'></td>
                                                <td width='620'>
                                                    <div align='center'>
                                                        <font class='l2 lb'>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN</font><br>
                                                        <font class='l2 lb'>RISET, DAN TEKNOLOGI</font><br>
                                                        <font class='l2 lb'>UNIVERSITAS MULAWARMAN</font><br>
                                                        <font class='l1 lb'>FAKULTAS ${fakultas.toUpperCase()}</font><br>
                                                        <!-- Bagian Alamat, Telp, Email, Laman telah dihapus -->
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        <hr>
                                        <br>
                                        <div align='center'>
                                            <font class='l2 lb lu'>KARTU HASIL STUDI (KHS)</font><br>
                                            <font class='l3 lb lu'>SEMESTER ${selectedSemester.nama.toUpperCase()}</font>
                                        </div>
                                        <br><br>
                                        <table width='100%'>
                                            <tr><td width='150px'>NAMA</td><td>: ${studentName.toUpperCase()}</td></tr>
                                            <tr><td>NIM</td><td>: ${studentNim}</td></tr>
                                            <tr><td>PROGRAM STUDI</td><td>: ${studentProdi.toUpperCase()}</td></tr>
                                            <tr><td>BEASISWA</td><td>: ${beasiswaText.toUpperCase()}</td></tr>
                                            <tr><td> </td><td> </td></tr>
                                        </table>
                                        <table class='tabel-common' width='100%'>
                                            <thead>
                                                <tr>
                                                    <th align='center'>NO</th>
                                                    <th align='center'>KODE MK</th>
                                                    <th align='center'>MATA KULIAH</th>
                                                    <th align='center'>W/P</th>
                                                    <th align='center'>SKS</th>
                                                    <th align='center'>NILAI</th>
                                                    <th align='center'>BOBOT</th>
                                                    <th align='center'>HASIL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${courseRowsHTML}
                                                <tr>
                                                    <th colspan='4' align='center'>TOTAL</th>
                                                    <th>${totalSks.toFixed(2)}</th>
                                                    <th colspan='2'></th>
                                                    <th>${totalHasil.toFixed(2)}</th>
                                                </tr>
                                                <tr>
                                                    <th colspan='8' align='left'><font class='l3 lb'>INDEKS PRESTASI (IP): ${summary.ip}</font></th>
                                                </tr>
                                                <tr>
                                                    <th colspan='8' align='left'><font class='l3 lb'>Maksimal SKS Semester Berikutnya: ${maksimalSksTeks}</font></th>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <br><br>
                                        <table>
                                            <tr>
                                                <td width='230'></td>
                                                <td width='230'></td>
                                                <td width='230'>Samarinda, ${getFormattedDate()}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td>Wakil Dekan Bidang Kemahasiswaan, Alumni, dan Kerja Sama</td>
                                            </tr>
                                            <tr>
                                                <td height='80'></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td><font class='lb lu'>${wakilDekanName}</font></td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td>NIP: ${wakilDekanNip}</td>
                                            </tr>
                                        </table>
                                    </page>
                                </body>
                            </html>`;
        
        printWindow.document.open();
        printWindow.document.write(finalHTML);
        printWindow.document.close();
        console.log(`✅ Halaman KHS kamu (dengan info SKS maks: ${maksimalSksTeks}) sudah siap dicetak di tab baru!`);
    }
})();