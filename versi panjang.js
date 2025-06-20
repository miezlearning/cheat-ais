(function() {
    const pilihan = prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuisioner\n8. Isi Otomatis");

    function isiKuesioner(nilai) {
        document.querySelectorAll('.form-check-input').forEach(button => {
            if (button.value === nilai) button.checked = true;
        });
        console.log(`%cKuesioner telah diisi otomatis dengan nilai ${nilai}.`, 'color: green; font-weight: bold;');
    }

    function isiKuesionerAcak(rentang) {
        const skalaPenilaian = document.querySelectorAll('.form-check-input');
        const groups = {};

        skalaPenilaian.forEach(button => {
            if (!groups[button.name]) groups[button.name] = [];
            groups[button.name].push(button);
        });

        Object.values(groups).forEach(buttons => {
            const filtered = buttons.filter(button => rentang.includes(parseInt(button.value)));
            if (filtered.length > 0) {
                const randomButton = filtered[Math.floor(Math.random() * filtered.length)];
                randomButton.checked = true;
            }
        });

        console.log(`%cKuesioner telah diisi acak dengan rentang ${rentang.join('-')}.`, 'color: blue; font-weight: bold;');
    }

    function baik() { isiKuesionerAcak([4, 5]); }
    function buruk() { isiKuesionerAcak([1, 2, 3]); }

    function resetKuesioner() {
        document.querySelectorAll('.form-check-input').forEach(button => button.checked = false);
        console.log("%cKuesioner telah direset.", 'color: orange; font-weight: bold;');
    }

    function OtomatisBanget() {
        let matkulIndex = parseInt(sessionStorage.getItem('currentMatkulIndex')) || 0;
        let dosenIndex = parseInt(sessionStorage.getItem('currentDosenIndex')) || 0;

        console.log(`%cMemulai pengisian dari mata kuliah ke-${matkulIndex + 1}, dosen ke-${dosenIndex + 1}.`, 'color: orange; font-weight: bold;');

        function isiDosenBerikutnya() {
            const mataKuliahRows = Array.from(document.querySelectorAll('table tbody tr')).filter(row => row.querySelector('.kuisioner'));

            if (matkulIndex >= mataKuliahRows.length) {
                console.log("%cSemua kuisioner telah selesai diisi!", 'color: green; font-weight: bold;');
                sessionStorage.clear();
                return;
            }

            const currentMatkulRow = mataKuliahRows[matkulIndex];
            const dosenBadges = currentMatkulRow.querySelectorAll('.badge-primary');
            const kuisionerButton = currentMatkulRow.querySelector('.kuisioner');

            if (!dosenBadges || dosenIndex >= dosenBadges.length) {
                matkulIndex++;
                dosenIndex = 0;
                sessionStorage.setItem('currentMatkulIndex', matkulIndex);
                sessionStorage.setItem('currentDosenIndex', dosenIndex);
                isiDosenBerikutnya();
                return;
            }

            const currentDosen = dosenBadges[dosenIndex];
            console.log(`%cMengisi kuisioner untuk dosen: ${currentDosen.textContent.trim()}`, 'color: blue; font-weight: bold;');

            if (kuisionerButton && isButtonVisible(kuisionerButton)) {
                sessionStorage.setItem('currentMatkulIndex', matkulIndex);
                sessionStorage.setItem('currentDosenIndex', dosenIndex);

                kuisionerButton.click();

                setTimeout(() => {
                    isiKuesionerUntukDosen(() => {
                        dosenIndex++;
                        isiDosenBerikutnya();
                    });
                }, 3000);
            } else {
                console.error("%cTombol kuisioner tidak ditemukan atau tidak valid untuk baris ini.", 'color: red; font-weight: bold;');
                dosenIndex++;
                isiDosenBerikutnya();
            }
        }

        function isiKuesionerUntukDosen(callback) {
            let step = 0;
            const totalSteps = 5;

            function klikNextStep() {
                if (step < totalSteps) {
                    const nextButton = document.getElementById('nextbtn');
                    if (nextButton && isButtonVisible(nextButton)) {
                        const currentQuestionInputs = document.querySelectorAll('.form-check-input');
                        const validInputs = Array.from(currentQuestionInputs).filter(input => !input.disabled);
                        if (validInputs.length > 0) {
                            const randomIndex = Math.floor(Math.random() * validInputs.length);
                            validInputs[randomIndex].checked = true;
                            console.log(`%cMengisi pertanyaan ke-${step + 1} dengan nilai acak.`, 'color: purple; font-weight: bold;');
                        } else {
                            console.warn(`%cPertanyaan ke-${step + 1} tidak ditemukan atau semua input dinonaktifkan. Melewati pengisian.`, 'color: orange; font-weight: bold;');
                        }

                        nextButton.click();
                        step++;
                        console.log(`%cKlik Next tahap ${step}`, 'color: blue; font-weight: bold;');
                        setTimeout(klikNextStep, 1000);
                    } else {
                        console.error(`%cTombol Next (${step + 1}) tidak ditemukan atau tidak terlihat.`, 'color: red; font-weight: bold;');
                        klikSubmit(callback);
                    }
                } else {
                    klikSubmit(callback);
                }
            }

            function klikSubmit(callback) {
                const submitButton = document.querySelector('button[type="submit"]');
                if (submitButton && isButtonVisible(submitButton)) {
                    console.log("%cKlik Submit.", 'color: green; font-weight: bold;');
                    submitButton.click();
                    setTimeout(callback, 2000);
                } else {
                    console.error("%cTombol Submit tidak ditemukan atau tidak terlihat.", 'color: red; font-weight: bold;');
                    setTimeout(callback, 1000);
                }
            }

            klikNextStep();
        }

        function isButtonVisible(button) {
            if (!button) return false;
            const style = window.getComputedStyle(button);
            return button.offsetParent !== null &&
                style.display !== 'none' && style.visibility !== 'hidden' && !button.disabled;
        }

        isiDosenBerikutnya();
    }

    if (pilihan === null) {
        console.log("%cProses dibatalkan oleh pengguna.", 'color: red; font-weight: bold;');
    } else {
        switch (pilihan) {
            case '1': case '2': case '3': case '4': case '5':
                isiKuesioner(pilihan);
                break;
            case '6':
                const pilihacakan = prompt("Pilih jenis acak:\n1. Buruk (1-3)\n2. Baik (4-5)");
                if (pilihacakan === '1') buruk();
                else if (pilihacakan === '2') baik();
                else console.log("%cPilihan tidak valid untuk acak.", 'color: red; font-weight: bold;');
                break;
            case '7':
                resetKuesioner();
                break;
            case '8':
                OtomatisBanget();
                break;
            default:
                console.log("%cPilihan tidak valid.", 'color: red; font-weight: bold;');
        }
    }
})();
