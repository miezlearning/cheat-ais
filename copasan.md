# Versi Panjang 
```js
(function () {
    function waitForElement(selector, callback, maxAttempts = 30, interval = 1000) {
        let attempts = 0;
        const intervalId = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(intervalId);
                callback(element);
            } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                console.error(`%cElemen ${selector} tidak ditemukan setelah ${maxAttempts} percobaan.`, 'color: red; font-weight: bold;');
            }
            attempts++;
        }, interval);
    }

    function isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return element.offsetParent !== null &&
               style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               !element.disabled;
    }

    function isiKuesioner(nilai) {
        document.querySelectorAll('.form-check-input').forEach(button => {
            if (button.value === nilai) {
                button.checked = true;
                button.dispatchEvent(new Event('change', { bubbles: true }));
            }
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
                randomButton.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        console.log(`%cKuesioner telah diisi acak dengan rentang ${rentang.join('-')}.`, 'color: blue; font-weight: bold;');
    }

    function baik() { isiKuesionerAcak([4, 5]); }
    function buruk() { isiKuesionerAcak([1, 2, 3]); }

    function resetKuesioner() {
        document.querySelectorAll('.form-check-input').forEach(button => {
            button.checked = false;
            button.dispatchEvent(new Event('change', { bubbles: true }));
        });
        console.log("%cKuesioner telah direset.", 'color: orange; font-weight: bold;');
    }

    function otomatisBanget() {
        let matkulIndex = parseInt(sessionStorage.getItem('currentMatkulIndex')) || 0;
        let dosenIndex = parseInt(sessionStorage.getItem('currentDosenIndex')) || 0;

        console.log(`%cMemulai pengisian dari mata kuliah ke-${matkulIndex + 1}, dosen ke-${dosenIndex + 1}.`, 'color: orange; font-weight: bold;');

        function isiDosenBerikutnya() {
            const mataKuliahRows = Array.from(document.querySelectorAll('table tbody tr'));
            console.log(`%cJumlah baris mata kuliah: ${mataKuliahRows.length}`, 'color: purple; font-weight: bold;');

            if (matkulIndex >= mataKuliahRows.length) {
                console.log("%cSemua kuesioner telah selesai diisi!", 'color: green; font-weight: bold;');
                sessionStorage.clear();
                return;
            }

            const currentMatkulRow = mataKuliahRows[matkulIndex];
            const dosenBadges = currentMatkulRow.querySelectorAll('.badge, .badge-primary');
            const kuisionerButton = currentMatkulRow.querySelector('a[href*="kuisioner"], button[href*="kuisioner"], .kuisioner, button.btn');

            console.log(`%cBaris mata kuliah saat ini:`, 'color: purple; font-weight: bold;', currentMatkulRow);
            console.log(`%cJumlah dosen: ${dosenBadges.length}`, 'color: purple; font-weight: bold;');
            console.log(`%cTombol kuesioner:`, 'color: purple; font-weight: bold;', kuisionerButton);

            if (!dosenBadges || dosenIndex >= dosenBadges.length) {
                console.log(`%cPindah ke mata kuliah berikutnya: matkulIndex=${matkulIndex + 1}`, 'color: purple; font-weight: bold;');
                matkulIndex++;
                dosenIndex = 0;
                sessionStorage.setItem('currentMatkulIndex', matkulIndex);
                sessionStorage.setItem('currentDosenIndex', dosenIndex);
                setTimeout(isiDosenBerikutnya, 1000);
                return;
            }

            const currentDosen = dosenBadges[dosenIndex];
            console.log(`%cMengisi kuesioner untuk dosen: ${currentDosen.textContent.trim()}`, 'color: blue; font-weight: bold;');

            if (kuisionerButton && isElementVisible(kuisionerButton)) {
                sessionStorage.setItem('currentMatkulIndex', matkulIndex);
                sessionStorage.setItem('currentDosenIndex', dosenIndex);

                // Nonaktifkan validasi form
                document.querySelectorAll('.form-kuisioner').forEach(form => {
                    form.classList.remove('needs-validation');
                    form.querySelectorAll('input[required]').forEach(input => input.removeAttribute('required'));
                });

                kuisionerButton.click();
                console.log(`%cMengklik tombol kuesioner`, 'color: green; font-weight: bold;');

                waitForElement('.form-check-input', () => {
                    console.log(`%cHalaman kuesioner dimuat`, 'color: green; font-weight: bold;');
                    isiKuesionerUntukDosen(() => {
                        dosenIndex++;
                        sessionStorage.setItem('currentDosenIndex', dosenIndex);
                        setTimeout(isiDosenBerikutnya, 2000);
                    });
                });
            } else {
                console.error("%cTombol kuesioner tidak ditemukan atau tidak valid.", 'color: red; font-weight: bold;');
                console.log(`%cStatus tombol:`, 'color: red; font-weight: bold;', {
                    exists: !!kuisionerButton,
                    visible: kuisionerButton ? isElementVisible(kuisionerButton) : false
                });
                dosenIndex++;
                sessionStorage.setItem('currentDosenIndex', dosenIndex);
                setTimeout(isiDosenBerikutnya, 1000);
            }
        }

        function isiKuesionerUntukDosen(callback) {
            let step = 0;
            const totalSteps = 5;

            function klikNextStep() {
                if (step < totalSteps) {
                    const nextButton = document.getElementById('nextbtn');
                    if (nextButton && isElementVisible(nextButton)) {
                        baik(); // Isi dengan nilai baik (4-5)
                        nextButton.dispatchEvent(new Event('click', { bubbles: true }));
                        step++;
                        console.log(`%cKlik Next tahap ${step}`, 'color: blue; font-weight: bold;');
                        setTimeout(klikNextStep, 1000);
                    } else {
                        console.error(`%cTombol Next (tahap ${step + 1}) tidak ditemukan atau tidak terlihat.`, 'color: red; font-weight: bold;');
                        klikSubmit(callback);
                    }
                } else {
                    klikSubmit(callback);
                }
            }

            function klikSubmit(callback) {
                const submitButton = document.querySelector('button[type="submit"], button#nextbtn');
                if (submitButton && isElementVisible(submitButton)) {
                    console.log("%cKlik Submit.", 'color: green; font-weight: bold;');
                    submitButton.dispatchEvent(new Event('click', { bubbles: true }));
                    setTimeout(callback, 2000);
                } else {
                    console.error("%cTombol Submit tidak ditemukan atau tidak terlihat.", 'color: red; font-weight: bold;');
                    setTimeout(callback, 1000);
                }
            }

            klikNextStep();
        }

        isiDosenBerikutnya();
    }

    const pilihan = prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuesioner\n8. Isi Otomatis");

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
                otomatisBanget();
                break;
            default:
                console.log("%cPilihan tidak valid.", 'color: red; font-weight: bold;');
        }
    }
})();
```






# Versi Pendek

Ini  hanya minify JS nya saja, tidak ada perubahan fitur atau kode didalmnya. Intinya ini versi minimalisnya

```js
const pilihan=prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuisioner\n8. Isi Otomatis");function isiKuesioner(e){document.querySelectorAll(".form-check-input").forEach(i=>{i.value===e&&(i.checked=!0)}),console.log(`%cKuesioner telah diisi otomatis dengan nilai ${e}.`,"color: green; font-weight: bold;")}function isiKuesionerAcak(e){let i=document.querySelectorAll(".form-check-input"),n={};i.forEach(e=>{n[e.name]||(n[e.name]=[]),n[e.name].push(e)}),Object.values(n).forEach(i=>{let n=i.filter(i=>e.includes(parseInt(i.value))),t=n[Math.floor(Math.random()*n.length)];t.checked=!0}),console.log(`%cKuesioner telah diisi acak dengan rentang ${e.join("-")}.`,"color: blue; font-weight: bold;")}function baik(){isiKuesionerAcak([4,5])}function buruk(){isiKuesionerAcak([1,2,3])}function resetKuesioner(){document.querySelectorAll(".form-check-input").forEach(e=>e.checked=!1),console.log("%cKuesioner telah direset.","color: orange; font-weight: bold;")}function OtomatisBanget(){let e=parseInt(sessionStorage.getItem("currentMatkulIndex"))||0,i=parseInt(sessionStorage.getItem("currentDosenIndex"))||0;console.log(`%cMemulai pengisian dari mata kuliah ke-${e+1}, dosen ke-${i+1}.`,"color: orange; font-weight: bold;"),!function n(){let t=document.querySelectorAll("tr");if(e>=t.length){console.log("%cSemua kuisioner telah selesai diisi!","color: green; font-weight: bold;"),sessionStorage.clear();return}let o=t[e],l=o.querySelectorAll(".badge-primary"),r=o.querySelector(".kuisioner");if(!l||i>=l.length){e++,i=0,sessionStorage.setItem("currentMatkulIndex",e),sessionStorage.setItem("currentDosenIndex",i),n();return}let a=l[i];console.log(`%cMengisi kuisioner untuk dosen: ${a.textContent.trim()}`,"color: blue; font-weight: bold;"),r&&function e(i){let n=window.getComputedStyle(i);return i&&null!==i.offsetParent&&"none"!==n.display&&"hidden"!==n.visibility}(r)?(sessionStorage.setItem("currentMatkulIndex",e),sessionStorage.setItem("currentDosenIndex",i),r.click(),setTimeout(()=>{var e;let t;e=()=>{i++,n()},t=0,!function i(){if(t<5){let n=document.getElementById("nextbtn");n?(baik(),n.click(),t++,console.log(`%cKlik Next tahap ${t}`,"color: blue; font-weight: bold;"),setTimeout(i,1e3)):console.error("%cTombol Next tidak ditemukan.","color: red; font-weight: bold;")}else(function e(i){let n=document.querySelector('button[type="submit"], button#nextbtn');n?(console.log("%cKlik Submit.","color: green; font-weight: bold;"),n.click(),setTimeout(i,2e3)):console.error("%cTombol Submit tidak ditemukan.","color: red; font-weight: bold;")})(e)}()},3e3)):(console.error("%cTombol kuisioner tidak ditemukan atau tidak valid.","color: red; font-weight: bold;"),i++,n())}()}if(null===pilihan)console.log("%cProses dibatalkan oleh pengguna.","color: red; font-weight: bold;");else switch(pilihan){case"1":case"2":case"3":case"4":case"5":isiKuesioner(pilihan);break;case"6":let e=prompt("Pilih jenis acak:\n1. Buruk (1-3)\n2. Baik (4-5)");"1"===e?buruk():"2"===e?baik():console.log("%cPilihan tidak valid.","color: red; font-weight: bold;");break;case"7":resetKuesioner();break;case"8":OtomatisBanget();break;default:console.log("%cPilihan tidak valid.","color: red; font-weight: bold;")}
```
