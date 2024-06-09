const pilihan = prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak");

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

switch (pilihan) {
    case '1': //Full Skala 1
    case '2': // Full Skala 2
    case '3': // Full Skala 3
    case '4': // Full Skala 4
    case '5': // Full Skala 5
        isiKuesioner(pilihan);
        break;

    case '6': // Skala Acak dengan pilihan.
        const pilihacakan = prompt("pilih jenis pengisian acak:\n1. Acak Buruk (nilai 1-3)\n2. Acak Baik (nilai 4-5)");
        switch (pilihacakan) {
            case '1':
                isiKuesionerAcak([1, 2, 3]);
                break;
            case '2':
                isiKuesionerAcak([4, 5]);
                break;
            default:
                console.log("%cDilihat baik baik menunya.", 'color: red; font-weight: bold;');
        }
        break;
    default:
        console.log("%cDilihat baik baik menunya.", 'color: red; font-weight: bold;');
}
