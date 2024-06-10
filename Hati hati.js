const pilihan = prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuisioner.\n8. Isi Otomatis");

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

function OtomatisBanget() {
    const buttons = document.querySelectorAll('a[href*="/mahasiswa/khs/kuisioner/"]');

    if (buttons.length === 0) {
        console.error("%cTidak ada tombol 'Isi Kuisioner' yang ditemukan.", 'color: red; font-weight: bold;');
        return;
    }

    let index = 0;

    function isiKuesionerBerikutnya() {
        if (index < buttons.length) {
            const currentButton = buttons[index];
            currentButton.click();
            console.log(`%cMengisi kuesioner ke-${index + 1} dengan tautan ${currentButton.href}.`, 'color: blue; font-weight: bold;');
            setTimeout(() => {
                isiKuesionerPadaPopUp();
            }, 2000);
        } else {
            console.log("%cSemua kuesioner telah diisi.", 'color: green; font-weight: bold;');
        }
    }

    function isiKuesionerPadaPopUp() {
        try {
            handleSteps();
        } catch (error) {
            console.error("Error saat mengisi kuesioner pada pop-up:", error);
        }
    }

    function handleSteps() {
        const nextButton = document.getElementById('nextbtn');
        const submitButton = document.querySelector('button[type="submit"]');
        const currentStep = document.querySelector('.stepper-horizontal .step.active');

        if (currentStep && currentStep.classList.contains('stepper-six')) {
            if (submitButton) {
                baik(); // Bagian ini ganti ke "buruk()" jika ingin mengganti skalanya
                submitButton.click();
                console.log("%cTombol 'Submit' telah diklik.", 'color: green; font-weight: bold;');
                setTimeout(() => {
                    window.location.href = "/mahasiswa/khs/kuisioner";
                    window.onload = function () {
                        index++;
                        isiKuesionerBerikutnya();
                    };
                }, 1000); 
            } else {
                console.error("Tombol 'Submit' tidak ditemukan.");
            }
        } else {
            baik(); // Bagian ini ganti ke "buruk()" jika ingin mengganti skalanya
            if (nextButton) {
                nextButton.click();
                console.log("%cTombol 'Next' telah diklik.", 'color: green; font-weight: bold;');
                setTimeout(() => {
                    handleSteps();
                }, 500); 
            } else {
                console.error("Tombol 'Next' tidak ditemukan.");
            }
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
            OtomatisBanget();
            break;
        default:
            console.log("%cDilihat baik-baik menunya.", 'color: red; font-weight: bold;');
    }
}
