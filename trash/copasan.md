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
!function(){function e(e){if(!e)return!1;const o=window.getComputedStyle(e);return null!==e.offsetParent&&"none"!==o.display&&"hidden"!==o.visibility&&!e.disabled}function o(e){const o=document.querySelectorAll(".form-check-input"),t={};o.forEach((e=>{t[e.name]||(t[e.name]=[]),t[e.name].push(e)})),Object.values(t).forEach((o=>{const t=o.filter((o=>e.includes(parseInt(o.value))));if(t.length>0){const e=t[Math.floor(Math.random()*t.length)];e.checked=!0,e.dispatchEvent(new Event("change",{bubbles:!0}))}})),console.log(`%cKuesioner telah diisi acak dengan rentang ${e.join("-")}.`,"color: blue; font-weight: bold;")}function t(){o([4,5])}const n=prompt("Pilih metode pengisian kuesioner:\n1. Isi dengan nilai 1\n2. Isi dengan nilai 2\n3. Isi dengan nilai 3\n4. Isi dengan nilai 4\n5. Isi dengan nilai 5\n6. Isi dengan nilai acak\n7. Reset kuesioner\n8. Isi Otomatis");if(null===n)console.log("%cProses dibatalkan oleh pengguna.","color: red; font-weight: bold;");else switch(n){case"1":case"2":case"3":case"4":case"5":l=n,document.querySelectorAll(".form-check-input").forEach((e=>{e.value===l&&(e.checked=!0,e.dispatchEvent(new Event("change",{bubbles:!0})))})),console.log(`%cKuesioner telah diisi otomatis dengan nilai ${l}.`,"color: green; font-weight: bold;");break;case"6":const i=prompt("Pilih jenis acak:\n1. Buruk (1-3)\n2. Baik (4-5)");"1"===i?o([1,2,3]):"2"===i?t():console.log("%cPilihan tidak valid untuk acak.","color: red; font-weight: bold;");break;case"7":document.querySelectorAll(".form-check-input").forEach((e=>{e.checked=!1,e.dispatchEvent(new Event("change",{bubbles:!0}))})),console.log("%cKuesioner telah direset.","color: orange; font-weight: bold;");break;case"8":!function(){let o=parseInt(sessionStorage.getItem("currentMatkulIndex"))||0,n=parseInt(sessionStorage.getItem("currentDosenIndex"))||0;console.log(`%cMemulai pengisian dari mata kuliah ke-${o+1}, dosen ke-${n+1}.`,"color: orange; font-weight: bold;"),function l(){const i=Array.from(document.querySelectorAll("table tbody tr"));if(console.log(`%cJumlah baris mata kuliah: ${i.length}`,"color: purple; font-weight: bold;"),o>=i.length)return console.log("%cSemua kuesioner telah selesai diisi!","color: green; font-weight: bold;"),void sessionStorage.clear();const r=i[o],c=r.querySelectorAll(".badge, .badge-primary"),a=r.querySelector('a[href*="kuisioner"], button[href*="kuisioner"], .kuisioner, button.btn');if(console.log("%cBaris mata kuliah saat ini:","color: purple; font-weight: bold;",r),console.log(`%cJumlah dosen: ${c.length}`,"color: purple; font-weight: bold;"),console.log("%cTombol kuesioner:","color: purple; font-weight: bold;",a),!c||n>=c.length)return console.log(`%cPindah ke mata kuliah berikutnya: matkulIndex=${o+1}`,"color: purple; font-weight: bold;"),o++,n=0,sessionStorage.setItem("currentMatkulIndex",o),sessionStorage.setItem("currentDosenIndex",n),void setTimeout(l,1e3);const s=c[n];console.log(`%cMengisi kuesioner untuk dosen: ${s.textContent.trim()}`,"color: blue; font-weight: bold;"),a&&e(a)?(sessionStorage.setItem("currentMatkulIndex",o),sessionStorage.setItem("currentDosenIndex",n),document.querySelectorAll(".form-kuisioner").forEach((e=>{e.classList.remove("needs-validation"),e.querySelectorAll("input[required]").forEach((e=>e.removeAttribute("required")))})),a.click(),console.log("%cMengklik tombol kuesioner","color: green; font-weight: bold;"),function(e,o,t=30,n=1e3){let l=0;const i=setInterval((()=>{const n=document.querySelector(e);n?(clearInterval(i),o(n)):l>=t&&(clearInterval(i),console.error(`%cElemen ${e} tidak ditemukan setelah ${t} percobaan.`,"color: red; font-weight: bold;")),l++}),n)}(".form-check-input",(()=>{console.log("%cHalaman kuesioner dimuat","color: green; font-weight: bold;"),function(o){let n=0;const l=5;function i(){if(n<l){const l=document.getElementById("nextbtn");l&&e(l)?(t(),l.dispatchEvent(new Event("click",{bubbles:!0})),n++,console.log(`%cKlik Next tahap ${n}`,"color: blue; font-weight: bold;"),setTimeout(i,1e3)):(console.error(`%cTombol Next (tahap ${n+1}) tidak ditemukan atau tidak terlihat.`,"color: red; font-weight: bold;"),r(o))}else r(o)}function r(o){const t=document.querySelector('button[type="submit"], button#nextbtn');t&&e(t)?(console.log("%cKlik Submit.","color: green; font-weight: bold;"),t.dispatchEvent(new Event("click",{bubbles:!0})),setTimeout(o,2e3)):(console.error("%cTombol Submit tidak ditemukan atau tidak terlihat.","color: red; font-weight: bold;"),setTimeout(o,1e3))}i()}((()=>{n++,sessionStorage.setItem("currentDosenIndex",n),setTimeout(l,2e3)}))}))):(console.error("%cTombol kuesioner tidak ditemukan atau tidak valid.","color: red; font-weight: bold;"),console.log("%cStatus tombol:","color: red; font-weight: bold;",{exists:!!a,visible:!!a&&e(a)}),n++,sessionStorage.setItem("currentDosenIndex",n),setTimeout(l,1e3))}()}();break;default:console.log("%cPilihan tidak valid.","color: red; font-weight: bold;")}var l}();
```
