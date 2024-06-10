const pilihan = prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuisioner.\n8. Isi Otomatis (Pilh Metode)");

// Kuisioner berdasarkan pilihan mahasiswa.
function isiKuesioner(nilai) {
    const skalaPenilaian = document.querySelectorAll('.form-check-input');
    skalaPenilaian.forEach(button => {
        if (button.value === nilai) {
            button.checked = true;
        }
    });
    console.log(`%cKuesioner telah diisi otomatis dengan nilai ${nilai}.`, 'color: green; font-weight: bold;');
}

// Kuisioner Acak yang bisa buhanmu pilih secara acak tetapi dengan skala yang sudah ditentukan :).
function isiKuesionerAcak(rentang) {
    const skalaPenilaian = document.querySelectorAll('.form-check-input');
    const groups = {};

    skalaPenilaian.forEach(button => {
        if (!groups[button.name]) {
            groups[button.name] = [];
        }
        groups[button.name].push(button);
    });

    for (let group in groups) {
        const buttons = groups[group];
        const filteredButtons = buttons.filter(button => rentang.includes(parseInt(button.value)));
        const randomIndex = Math.floor(Math.random() * filteredButtons.length);
        filteredButtons[randomIndex].checked = true;
    }

    // Informasi untuk metode yang kamu gunakan :D
    let metode = rentang.length > 1 ? "baik" : "buruk";

    console.log(`%cKuesioner telah diisi otomatis dengan nilai acak dalam rentang ${rentang.join('-')} menggunakan acak ${metode}.`, 'color: blue; font-weight: bold;');
}

function baik() {
    isiKuesionerAcak([4, 5]);
}

function buruk() {
    isiKuesionerAcak([1, 2, 3]);
}

function resetKuesioner() {
    const skalaPenilaian = document.querySelectorAll('.form-check-input');
    skalaPenilaian.forEach(button => {
        button.checked = false;
    });
    console.log("%cKuesioner telah direset.", 'color: orange; font-weight: bold;');
}

function OtomatisBanget(kondisi) {
    const buttons = document.querySelectorAll('a[href*="/mahasiswa/khs/kuisioner/"]');
    let index = 0;
    let isCanceled = false;

    function isiKuesionerBerikutnya() {
        if (index < buttons.length && !isCanceled) {
            if (!kondisi || confirm("Apakah Anda yakin ingin melanjutkan pengisian otomatis untuk kuesioner berikutnya?")) {
                buttons[index].click();
                index++; 
                nextTahap(1);
            } else {
                isCanceled = true;
                console.log("%cPengisian otomatis dibatalkan oleh pengguna.", 'color: red; font-weight: bold;');
            }
        } else {
            console.log("%cSemua kuesioner telah diisi.", 'color: green; font-weight: bold;');
        }
    }

    function nextTahap(tahap) {
        if (tahap <= 6) {
            setTimeout(() => {
                const nextButton = document.getElementById('nextbtn');
                if (nextButton) {
                    nextButton.click();
                    setTimeout(() => {
                        baik();
                        nextTahap(tahap + 1);
                    }, 500);
                } else {
                    console.error("Tombol 'nextbtn' tidak ditemukan.");
                    isiKuesionerBerikutnya();
                }
            }, 1000);
        } else {
            setTimeout(() => {
                console.log("%cTahap selesai. Kuesioner berikutnya...", 'color: blue; font-weight: bold;');
                setTimeout(() => {
                    isiKuesionerBerikutnya(); 
                }, 3000);
            }, 3000);
        }
    }

    isiKuesionerBerikutnya();
}

// Kondisi jika orang batal melakukan.
if (pilihan === null) {
    console.log("%cProses dibatalkan oleh pengguna.", 'color: red; font-weight: bold;');
} else {
    switch (pilihan) {
        case '1': // Full Skala 1
        case '2': // Full Skala 2
        case '3': // Full Skala 3
        case '4': // Full Skala 4
        case '5': // Full Skala 5
            isiKuesioner(pilihan);
            break;

        case '6': // Skala Acak dengan pilihan.
            const pilihacakan = prompt("Pilih jenis pengisian acak:\n1. Acak Buruk (nilai 1-3)\n2. Acak Baik (nilai 4-5)");
            // Kondisi jika orang batal melakukan.
            if (pilihacakan === null) {
                console.log("%cProses dibatalkan oleh pengguna.", 'color: red; font-weight: bold;');
            } else {
                switch (pilihacakan) {
                    case '1':
                        buruk();
                        break;
                    case '2':
                        baik();
                        break;
                    default:
                        console.log("%cDilihat baik-baik menunya.", 'color: red; font-weight: bold;');
                }
            }
            break;
        case '7': // Reset skalanya.
            resetKuesioner();
            break;
        case '8': // Isi otomatis kuesioner.
            const metodeOtomatis = prompt("Pilih metode pengisian otomatis:\n1. Dengan konfirmasi di setiap langkah\n2. Otomatis hingga selesai");
            if (metodeOtomatis === null) {
                console.log("%cProses dibatalkan oleh pengguna.", 'color: red; font-weight: bold;');
            } else {
                switch (metodeOtomatis) {
                    case '1':
                        OtomatisBanget(true);
                        break;
                    case '2':
                        OtomatisBanget(false);
                        break;
                    default:
                        console.log("%cDilihat baik-baik menunya.", 'color: red; font-weight: bold;');
                }
            }
            break;
        default:
            console.log("%cDilihat baik-baik menunya.", 'color: red; font-weight: bold;');
    }

}

