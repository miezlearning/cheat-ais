(async () => {
  console.clear();
  console.log("🚀 Skrip Cetak KHS Otomatis...... DIMULAI!!");

  const semesterElements = document.querySelectorAll(
    "li.lihat, li.inbox-data.lihat",
  );
  if (semesterElements.length === 0) {
    console.error(
      "❌ Gagal menemukan daftar semester. Pastikan kamu berada di halaman KHS AIS yang benar.",
    );
    return;
  }

  const semesters = Array.from(semesterElements).map((el, index) => {
    const cetakLink = el.querySelector(
      'a[href*="/mahasiswa/khs/cetak/"], a[href*="mahasiswa/khs/cetak"]',
    );
    const cetakUrl = normalizeUrl(cetakLink?.getAttribute("href") || "");
    const key = el.dataset.key || extractKeyFromCetakUrl(cetakUrl);
    const detailUrl = buildDetailUrl(cetakUrl, key);

    return {
      nomor: index + 1,
      nama:
        el.querySelector("div.email-data > span")?.innerText.trim() ||
        el.innerText.trim() ||
        `Semester ${index + 1}`,
      element: el,
      key,
      detailUrl,
      cetakUrl,
      stats: extractSemesterStats(el),
    };
  });

  const mode = prompt(
    "Pilih mode KHS yang ingin diproses:\n\n" +
      "1. Satu semester saja\n" +
      "2. Rentang semester, contoh: 2-5\n" +
      "3. Semua semester\n" +
      "4. Pilih beberapa semester, contoh: 1,3,5 atau 1,3-5\n\n" +
      "Catatan: nomor semester mengikuti daftar yang muncul di halaman AIS.",
  );

  if (mode === null) {
    console.log("ℹ️ Oke, kamu membatalkan operasi.");
    return;
  }

  const trimmedMode = mode.trim();
  let selectedSemesters = [];

  if (trimmedMode === "1") {
    const choice = prompt(
      buildSemesterListText("Pilih 1 semester yang ingin kamu lihat/cetak:"),
    );
    if (choice === null) {
      console.log("ℹ️ Oke, kamu membatalkan operasi.");
      return;
    }

    const parsed = parseSemesterSelection(choice, semesters.length);
    if (!parsed.valid || parsed.indices.length !== 1) {
      alert(
        parsed.message ||
          "❌ Pilihan tidak valid. Untuk mode ini masukkan tepat 1 nomor semester.",
      );
      return;
    }

    selectedSemesters = parsed.indices.map((index) => semesters[index - 1]);
    const selectedSemester = selectedSemesters[0];

    if (
      confirm(
        `Detail KHS untuk semester ${selectedSemester.nama} akan ditampilkan di halaman ini.\n\n--> Tekan 'OK' jika kamu juga ingin membuat versi CETAK.\n--> Tekan 'Batal' jika kamu hanya ingin melihatnya di halaman ini saja.`,
      )
    ) {
      const printWindow = openPrintWindow();
      if (!printWindow) return;

      const studentData = collectStudentData(printWindow);
      if (!studentData) return;

      await processSemestersForPrint(
        selectedSemesters,
        printWindow,
        studentData,
      );
    } else {
      openSemesterInCurrentPage(selectedSemester);
    }

    return;
  }

  if (trimmedMode === "2") {
    const rangeInput = prompt(
      buildSemesterListText(
        "Masukkan rentang semester yang ingin dicetak. Contoh: 2-5",
      ),
    );
    if (rangeInput === null) {
      console.log("ℹ️ Oke, kamu membatalkan operasi.");
      return;
    }

    if (!/^\s*\d+\s*-\s*\d+\s*$/.test(rangeInput)) {
      alert("❌ Format rentang tidak valid. Gunakan format seperti 2-5.");
      return;
    }

    const parsed = parseSemesterSelection(rangeInput, semesters.length);
    if (!parsed.valid) {
      alert(parsed.message);
      return;
    }

    selectedSemesters = parsed.indices.map((index) => semesters[index - 1]);
  } else if (trimmedMode === "3") {
    selectedSemesters = semesters;
  } else if (trimmedMode === "4") {
    const listInput = prompt(
      buildSemesterListText(
        "Masukkan nomor semester yang ingin dicetak. Contoh: 1,3,5 atau 1,3-5",
      ),
    );
    if (listInput === null) {
      console.log("ℹ️ Oke, kamu membatalkan operasi.");
      return;
    }

    const parsed = parseSemesterSelection(listInput, semesters.length);
    if (!parsed.valid) {
      alert(parsed.message);
      return;
    }

    selectedSemesters = parsed.indices.map((index) => semesters[index - 1]);
  } else {
    alert(
      "❌ Mode tidak valid. Jalankan ulang skrip lalu pilih 1, 2, 3, atau 4.",
    );
    return;
  }

  if (selectedSemesters.length === 0) {
    alert("❌ Tidak ada semester yang dipilih.");
    return;
  }

  const selectedNames = selectedSemesters
    .map((semester) => `${semester.nomor}. ${semester.nama}`)
    .join("\n");
  const lanjut = confirm(
    `${selectedSemesters.length} KHS berikut akan dibuat dalam 1 tab cetak:\n\n${selectedNames}\n\n` +
      "Tekan OK untuk lanjut, atau Batal untuk membatalkan.",
  );

  if (!lanjut) {
    console.log("ℹ️ Oke, kamu membatalkan operasi.");
    return;
  }

  const printWindow = openPrintWindow();
  if (!printWindow) return;

  const studentData = collectStudentData(printWindow);
  if (!studentData) return;

  await processSemestersForPrint(selectedSemesters, printWindow, studentData);

  function buildSemesterListText(title) {
    let menuText = `${title}\n\n`;
    semesters.forEach((semester) => {
      const infoIps = semester.stats.ips ? ` | IPS: ${semester.stats.ips}` : "";
      menuText += `${semester.nomor}. ${semester.nama}${infoIps}\n`;
    });
    return menuText;
  }

  function parseSemesterSelection(input, maxNumber) {
    const rawInput = input.trim();
    if (!rawInput) {
      return {
        valid: false,
        message: "❌ Input kosong. Masukkan nomor semester terlebih dahulu.",
        indices: [],
      };
    }

    const result = [];
    const used = new Set();
    const parts = rawInput
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (/^\d+\s*-\s*\d+$/.test(part)) {
        const [startText, endText] = part.split("-").map((text) => text.trim());
        const start = Number(startText);
        const end = Number(endText);
        const step = start <= end ? 1 : -1;

        for (let current = start; current !== end + step; current += step) {
          const validation = validateSemesterNumber(current, maxNumber);
          if (!validation.valid) return validation;
          pushUnique(result, used, current);
        }
      } else if (/^\d+$/.test(part)) {
        const number = Number(part);
        const validation = validateSemesterNumber(number, maxNumber);
        if (!validation.valid) return validation;
        pushUnique(result, used, number);
      } else {
        return {
          valid: false,
          message:
            "❌ Format pilihan tidak valid. Gunakan nomor, koma, atau rentang. Contoh: 1,3,5 atau 2-5.",
          indices: [],
        };
      }
    }

    return { valid: result.length > 0, message: "", indices: result };
  }

  function validateSemesterNumber(number, maxNumber) {
    if (!Number.isInteger(number) || number < 1 || number > maxNumber) {
      return {
        valid: false,
        message: `❌ Nomor semester ${number} tidak valid. Pilih angka 1 sampai ${maxNumber}.`,
        indices: [],
      };
    }

    return { valid: true, message: "", indices: [] };
  }

  function pushUnique(result, used, number) {
    if (!used.has(number)) {
      used.add(number);
      result.push(number);
    }
  }

  function openPrintWindow() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "❌ Gagal membuka tab baru. Mohon izinkan pop-up untuk situs ini dan jalankan skrip lagi.",
      );
      return null;
    }

    printWindow.document.write(
      "<h1>Sedang menyiapkan data KHS, mohon tunggu sebentar...</h1>",
    );
    printWindow.document.close();
    return printWindow;
  }

  function collectStudentData(printWindow) {
    const studentName = prompt("Masukkan Nama Lengkap kamu:", "MUHAMMAD ALIF");
    const studentNim = prompt("Masukkan NIM kamu:", "2209106127");
    const studentProdi = prompt(
      "Masukkan Program Studi kamu:",
      "S1 - INFORMATIKA",
    );
    const fakultas = prompt("Masukkan Nama Fakultas:", "Teknik");

    let beasiswaText = "-";
    if (confirm("Apakah kamu menerima beasiswa?")) {
      const beasiswaName = prompt("Masukkan nama beasiswanya:");
      if (beasiswaName && beasiswaName.trim()) {
        beasiswaText = beasiswaName.trim();
      }
    }

    const wakilDekanName = prompt(
      "Masukkan Nama Wakil Dekan:",
      "Ir. Fahrizal Adnan, S. T., M. Sc.",
    );
    const wakilDekanNip = prompt(
      "Masukkan NIP Wakil Dekan:",
      "198807262019031010",
    );

    if (
      !studentName ||
      !studentNim ||
      !studentProdi ||
      !fakultas ||
      !wakilDekanName ||
      !wakilDekanNip
    ) {
      printWindow.close();
      alert("❌ Data yang kamu masukkan tidak lengkap. Operasi dibatalkan.");
      return null;
    }

    return {
      studentName: studentName.trim(),
      studentNim: studentNim.trim(),
      studentProdi: studentProdi.trim(),
      fakultas: fakultas.trim(),
      beasiswaText,
      wakilDekanName: wakilDekanName.trim(),
      wakilDekanNip: wakilDekanNip.trim(),
    };
  }

  function openSemesterInCurrentPage(semester) {
    if (semester.cetakUrl) {
      console.log(
        `✅ Membuka link cetak KHS semester "${semester.nama}" di halaman ini.`,
      );
      window.location.href = semester.cetakUrl;
      return;
    }

    semester.element.click();
    console.log(
      `✅ Aksi klik pada semester "${semester.nama}" telah disimulasikan.`,
    );
    console.log(
      "👇 Detail KHS kamu akan muncul di bawah di halaman ini. Silakan gulir ke bawah.",
    );
  }

  async function processSemestersForPrint(
    selectedSemesters,
    printWindow,
    studentData,
  ) {
    const pages = [];

    for (let index = 0; index < selectedSemesters.length; index++) {
      const semester = selectedSemesters[index];
      const progressText = `Memproses KHS ${index + 1} dari ${selectedSemesters.length}: ${escapeHTML(semester.nama)}`;

      updatePrintWindowLoading(printWindow, progressText);
      console.log(`⏳ ${progressText}`);

      try {
        const pageHTML = await loadSemesterAndBuildPage(semester, studentData);
        pages.push(pageHTML);
        console.log(`✅ KHS semester "${semester.nama}" berhasil diproses.`);
      } catch (error) {
        console.error(
          `❌ Gagal memproses KHS semester "${semester.nama}":`,
          error,
        );
        pages.push(generateErrorPage(semester, error.message));
      }

      await sleep(350);
    }

    writePrintableDocument(printWindow, pages, studentData);
    console.log(
      `✅ ${pages.length} halaman KHS sudah siap dicetak di tab baru!`,
    );
  }

  function updatePrintWindowLoading(printWindow, text) {
    try {
      printWindow.document.open();
      printWindow.document.write(
        `<h1>Sedang memuat data KHS...</h1><p>${text}</p>`,
      );
      printWindow.document.close();
    } catch (error) {
      console.warn(
        "⚠️ Tidak bisa memperbarui tab cetak. Mungkin tab sudah ditutup.",
        error,
      );
    }
  }

  async function loadSemesterAndBuildPage(selectedSemester, studentData) {
    const semesterDocument = await fetchSemesterDocument(selectedSemester);
    return generateKhsPageHTML(
      semesterDocument.document,
      studentData,
      selectedSemester,
      semesterDocument.source,
    );
  }

  async function fetchSemesterDocument(semester) {
    const errors = [];

    if (!semester.detailUrl && !semester.cetakUrl) {
      throw new Error(
        "Semester ini tidak memiliki data-key atau link cetak, jadi tidak bisa diambil otomatis.",
      );
    }

    if (semester.detailUrl) {
      try {
        const document = await fetchDocumentFromUrl({
          label: "detail",
          url: semester.detailUrl,
          ajax: true,
          retries: 2,
        });
        const courseData = extractCourseData(document);

        if (courseData.courses.length > 0) {
          console.log(
            `✅ Data detail untuk "${semester.nama}" berhasil diambil (${courseData.courses.length} mata kuliah).`,
          );
          return { document, source: "detail", url: semester.detailUrl };
        }

        const preview = getDocumentPreview(document);
        console.warn(
          `⚠️ Data detail untuk "${semester.nama}" berhasil diambil, tapi tabel mata kuliah belum terdeteksi. Preview: ${preview}`,
        );
        errors.push(
          `detail: response berhasil, tapi tabel mata kuliah tidak ditemukan. Preview: ${preview}`,
        );
      } catch (error) {
        console.warn(
          `⚠️ Gagal mengambil data detail untuk "${semester.nama}": ${error.message}`,
        );
        errors.push(`detail: ${error.message}`);
      }
    }

    try {
      console.log(
        `🖱️ Mencoba mode klik bawaan AIS untuk "${semester.nama}"...`,
      );
      const document = await loadDocumentUsingSiteClick(semester);
      const courseData = extractCourseData(document);

      if (courseData.courses.length > 0) {
        console.log(
          `✅ Mode klik bawaan AIS untuk "${semester.nama}" berhasil (${courseData.courses.length} mata kuliah).`,
        );
        return { document, source: "site-click", url: semester.detailUrl };
      }

      const preview = getDocumentPreview(document);
      errors.push(
        `klik bawaan AIS: response-detail muncul, tapi tabel mata kuliah tidak ditemukan. Preview: ${preview}`,
      );
    } catch (error) {
      console.warn(
        `⚠️ Mode klik bawaan AIS untuk "${semester.nama}" gagal: ${error.message}`,
      );
      errors.push(`klik bawaan AIS: ${error.message}`);
    }

    if (semester.cetakUrl) {
      try {
        console.log(
          `🧭 Mencoba membuka halaman cetak via iframe untuk "${semester.nama}" dari: ${semester.cetakUrl}`,
        );
        const document = await loadDocumentInIframe(semester.cetakUrl);
        const courseData = extractCourseData(document);

        if (courseData.courses.length > 0 || looksLikePrintableKhs(document)) {
          console.log(
            `✅ Halaman cetak via iframe untuk "${semester.nama}" berhasil dibaca.`,
          );
          return { document, source: "cetak-iframe", url: semester.cetakUrl };
        }

        const preview = getDocumentPreview(document);
        errors.push(
          `cetak iframe: halaman terbuka, tapi KHS tidak terdeteksi. Preview: ${preview}`,
        );
      } catch (error) {
        console.warn(
          `⚠️ Halaman cetak via iframe untuk "${semester.nama}" gagal: ${error.message}`,
        );
        errors.push(`cetak iframe: ${error.message}`);
      }

      try {
        const document = await fetchDocumentFromUrl({
          label: "cetak",
          url: semester.cetakUrl,
          ajax: false,
          retries: 1,
        });
        const courseData = extractCourseData(document);

        if (courseData.courses.length > 0 || looksLikePrintableKhs(document)) {
          console.log(
            `✅ Data cetak untuk "${semester.nama}" berhasil diambil.`,
          );
          return { document, source: "cetak", url: semester.cetakUrl };
        }

        const preview = getDocumentPreview(document);
        errors.push(
          `cetak: response berhasil, tapi KHS tidak terdeteksi. Preview: ${preview}`,
        );
      } catch (error) {
        console.warn(
          `⚠️ Gagal mengambil data cetak untuk "${semester.nama}": ${error.message}`,
        );
        errors.push(`cetak: ${error.message}`);
      }
    }

    throw new Error(
      `Tidak bisa mengambil data KHS otomatis. Detail error: ${errors.join(" | ")}`,
    );
  }

  async function fetchDocumentFromUrl({ label, url, ajax, retries }) {
    console.log(`🔎 Mengambil data ${label} dari: ${url}`);
    const html = await fetchHTML(url, ajax, retries);
    return parseResponseToDocument(html);
  }

  async function fetchHTML(url, isAjax, retries = 1) {
    const headers = {
      Accept: isAjax
        ? "text/html, */*; q=0.01"
        : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    if (isAjax) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }

    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers,
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} ${response.statusText || ""}`.trim(),
          );
        }

        return response.text();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          console.warn(
            `⚠️ Request gagal (${error.message}). Mencoba ulang ${attempt + 1}/${retries}...`,
          );
          await sleep(900 * attempt);
        }
      }
    }

    throw lastError;
  }

  async function loadDocumentUsingSiteClick(semester) {
    const container = await waitForResponseDetailContainer();
    container.innerHTML = `<div data-auto-khs-loading="true">Memuat ${escapeHTML(semester.nama)}...</div>`;

    triggerSemesterClick(semester);

    const loadedContainer = await waitForRenderedKhs(container);
    return loadedContainer.cloneNode(true);
  }

  function waitForResponseDetailContainer(maxAttempts = 20, interval = 250) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const intervalId = setInterval(() => {
        const container = document.querySelector("#response-detail");
        if (container) {
          clearInterval(intervalId);
          resolve(container);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          reject(
            new Error("Elemen #response-detail tidak ditemukan di halaman."),
          );
        }
      }, interval);
    });
  }

  function triggerSemesterClick(semester) {
    if (window.jQuery) {
      window.jQuery(semester.element).trigger("click");
      return;
    }

    semester.element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  }

  function waitForRenderedKhs(container, maxAttempts = 50, interval = 300) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const intervalId = setInterval(() => {
        const text = getCellText(container);
        const hasLoadingMarker = Boolean(
          container.querySelector("[data-auto-khs-loading]"),
        );
        const courseData = extractCourseData(container);

        if (courseData.courses.length > 0) {
          clearInterval(intervalId);
          resolve(container);
          return;
        }

        if (!hasLoadingMarker && looksLikeServerErrorText(text)) {
          clearInterval(intervalId);
          reject(
            new Error(
              `AIS menampilkan error saat memuat detail: ${trimPreview(text)}`,
            ),
          );
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          reject(
            new Error(
              `Detail KHS tidak muncul setelah ${(maxAttempts * interval) / 1000} detik. Preview: ${trimPreview(text)}`,
            ),
          );
        }
      }, interval);
    });
  }

  function loadDocumentInIframe(url) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;opacity:0;";

      const cleanup = () => {
        clearTimeout(timeoutId);
        iframe.remove();
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Waktu tunggu iframe habis."));
      }, 25000);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            const iframeDocument =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDocument) {
              throw new Error("Dokumen iframe tidak bisa dibaca.");
            }

            const clonedDocument = parseHTML(
              iframeDocument.documentElement.outerHTML,
            );
            const preview = getDocumentPreview(clonedDocument);

            cleanup();

            if (looksLikeServerErrorText(preview)) {
              reject(new Error(`Halaman cetak AIS berisi error: ${preview}`));
              return;
            }

            resolve(clonedDocument);
          } catch (error) {
            cleanup();
            reject(error);
          }
        }, 700);
      };

      iframe.onerror = () => {
        cleanup();
        reject(new Error("Iframe gagal memuat halaman cetak."));
      };

      document.body.appendChild(iframe);
      iframe.src = url;
    });
  }

  function parseResponseToDocument(responseText) {
    const trimmed = responseText.trim();

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const json = JSON.parse(trimmed);
        const htmlCandidates = collectHtmlStrings(json);
        if (htmlCandidates.length > 0) {
          return parseHTML(htmlCandidates.map(decodeHtmlEntities).join("\n"));
        }

        const courses = extractCoursesFromJson(json);
        if (courses.length > 0) {
          return buildDocumentFromCourseObjects(
            courses,
            extractIpFromJson(json),
          );
        }

        return parseHTML(
          `<pre>${escapeHTML(JSON.stringify(json, null, 2))}</pre>`,
        );
      } catch (error) {
        console.warn(
          "⚠️ Response terlihat seperti JSON, tapi gagal diparse. Akan diparse sebagai HTML biasa.",
          error,
        );
      }
    }

    return parseHTML(responseText);
  }

  function parseHTML(html) {
    return new DOMParser().parseFromString(html, "text/html");
  }

  function collectHtmlStrings(value, result = []) {
    if (typeof value === "string") {
      const text = value.trim();
      const decoded = decodeHtmlEntities(text);
      if (
        /<\s*(table|tbody|tr|td|div|page)\b/i.test(text) ||
        /<\s*(table|tbody|tr|td|div|page)\b/i.test(decoded) ||
        text.includes("list-id-kelas") ||
        decoded.includes("list-id-kelas")
      ) {
        result.push(decoded);
      }
      return result;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectHtmlStrings(item, result));
      return result;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach((item) => collectHtmlStrings(item, result));
    }

    return result;
  }

  function decodeHtmlEntities(value) {
    if (!/[&][a-zA-Z#0-9]+;/.test(value)) return value;

    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  }

  function extractCoursesFromJson(value) {
    const arrays = [];

    function visit(current) {
      if (Array.isArray(current)) {
        arrays.push(current);
        current.forEach(visit);
        return;
      }

      if (current && typeof current === "object") {
        Object.values(current).forEach(visit);
      }
    }

    visit(value);

    for (const array of arrays) {
      const coursesFromArrays = array
        .filter((item) => Array.isArray(item) && item.length >= 8)
        .map(mapJsonArrayToCourse)
        .filter((course) => course && (course.kodeMk || course.namaMk));

      if (coursesFromArrays.length > 0) return coursesFromArrays;

      const courses = array
        .filter(
          (item) => item && typeof item === "object" && !Array.isArray(item),
        )
        .map(mapJsonObjectToCourse)
        .filter(
          (course) =>
            course && (course.kodeMk || course.namaMk) && course.sks !== "",
        );

      if (courses.length > 0) return courses;
    }

    return [];
  }

  function mapJsonArrayToCourse(item) {
    return {
      kodeMk: stripHTML(item[1]) || "N/A",
      namaMk: stripHTML(item[2]) || "-",
      wp: stripHTML(item[3]) || "-",
      sks: stripHTML(item[4]) || "0",
      nilai: stripHTML(item[5]) || stripHTML(item[6]) || "-",
      bobot: stripHTML(item[6]) || stripHTML(item[7]) || "-",
      hasil: stripHTML(item[7]) || stripHTML(item[8]) || "0",
    };
  }

  function mapJsonObjectToCourse(item) {
    const kodeMk = getJsonValue(item, [
      "kode_mk",
      "kodemk",
      "kode",
      "kd_mk",
      "kdmk",
    ]);
    const namaMk = getJsonValue(item, [
      "nama_mk",
      "namamk",
      "mata_kuliah",
      "matakuliah",
      "nama_matakuliah",
      "nama",
    ]);
    const sks = getJsonValue(item, ["sks", "jumlah_sks"]);

    if (!kodeMk && !namaMk && !sks) return null;

    return {
      kodeMk: kodeMk || "N/A",
      namaMk: namaMk || "-",
      wp: getJsonValue(item, ["wp", "w_p", "wajib_pilihan", "jenis"]) || "-",
      sks: sks || "0",
      nilai: getJsonValue(item, ["nh", "nilai", "nilai_huruf", "huruf"]) || "-",
      bobot: getJsonValue(item, ["bbt", "bobot", "nilai_bobot"]) || "-",
      hasil:
        getJsonValue(item, [
          "hasil",
          "sks_x_bbt",
          "sksxbobot",
          "sks_x_bobot",
          "total",
        ]) || "0",
    };
  }

  function getJsonValue(item, keys) {
    const entries = Object.entries(item);

    for (const wantedKey of keys) {
      const normalizedWantedKey = normalizeKey(wantedKey);
      const found = entries.find(
        ([key]) => normalizeKey(key) === normalizedWantedKey,
      );
      if (found && found[1] !== null && found[1] !== undefined)
        return String(found[1]).trim();
    }

    for (const wantedKey of keys) {
      const normalizedWantedKey = normalizeKey(wantedKey);
      const found = entries.find(([key]) =>
        normalizeKey(key).includes(normalizedWantedKey),
      );
      if (found && found[1] !== null && found[1] !== undefined)
        return String(found[1]).trim();
    }

    return "";
  }

  function normalizeKey(key) {
    return String(key)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function buildDocumentFromCourseObjects(courses, ipText) {
    const rows = courses
      .map(
        (course, index) => `<tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(course.kodeMk || "N/A")}</td>
          <td>${escapeHTML(course.namaMk || "-")}</td>
          <td>${escapeHTML(course.wp || "-")}</td>
          <td>${escapeHTML(course.sks || "0")}</td>
          <td>${escapeHTML(course.nilai || "-")}</td>
          <td>${escapeHTML(course.bobot || "-")}</td>
          <td>${escapeHTML(course.hasil || "0")}</td>
        </tr>`,
      )
      .join("\n");

    return parseHTML(
      `<div id="response-detail"><span id="ip">${escapeHTML(ipText || "0.00")}</span><table><tbody>${rows}</tbody></table></div>`,
    );
  }

  function extractIpFromJson(value) {
    let foundIp = "";

    function visit(current, keyName = "") {
      if (foundIp) return;

      if (current && typeof current === "object") {
        Object.entries(current).forEach(([key, child]) => visit(child, key));
        return;
      }

      if (typeof current === "string" || typeof current === "number") {
        const normalizedKey = normalizeKey(keyName);
        if (["ip", "ips", "indeksprestasi"].includes(normalizedKey)) {
          foundIp = String(current).trim();
        }
      }
    }

    visit(value);
    return foundIp;
  }

  function getDocumentPreview(source) {
    return trimPreview(getCellText(source));
  }

  function trimPreview(value, maxLength = 240) {
    const text = String(value || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return "(kosong)";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  function looksLikeServerErrorText(text) {
    return /internal\s+server\s+error|server\s+error|whoops|exception|error\s+500|http\s+500/i.test(
      String(text || ""),
    );
  }

  function looksLikePrintableKhs(source) {
    const text = getCellText(source);
    return /kartu\s+hasil\s+studi|\bKHS\b|indeks\s+prestasi/i.test(text);
  }

  function generateKhsPageHTML(
    detailContainer,
    studentData,
    selectedSemester,
    source,
  ) {
    const courseData = extractCourseData(detailContainer);

    if (courseData.courses.length === 0 && source.startsWith("cetak")) {
      const embeddedPage = generateEmbeddedCetakPage(
        detailContainer,
        selectedSemester,
      );
      if (embeddedPage) return embeddedPage;
    }

    const courseRowsHTML =
      courseData.courseRowsHTML ||
      `<tr><td colspan="8" align="center">Data mata kuliah tidak ditemukan.</td></tr>`;
    const ipText = extractIpText(detailContainer, selectedSemester.stats.ips);
    const ipValue = parseFloat(ipText.replace(",", ".")) || 0;
    const maksimalSksTeks = getMaksimalSksText(ipValue);

    return `<page class="khs-page">
                    <table>
                        <tr>
                            <td><img src="https://sia-arsip.unmul.ac.id/public/img/logo-cetak.jpg" width="100" alt="Logo Unmul"></td>
                            <td width="620">
                                <div align="center">
                                    <font class="l2 lb">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN</font><br>
                                    <font class="l2 lb">RISET, DAN TEKNOLOGI</font><br>
                                    <font class="l2 lb">UNIVERSITAS MULAWARMAN</font><br>
                                    <font class="l1 lb">FAKULTAS ${escapeHTML(studentData.fakultas.toUpperCase())}</font><br>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <hr>
                    <br>
                    <div align="center">
                        <font class="l2 lb lu">KARTU HASIL STUDI (KHS)</font><br>
                        <font class="l3 lb lu">SEMESTER ${escapeHTML(selectedSemester.nama.toUpperCase())}</font>
                    </div>
                    <br><br>
                    <table width="100%">
                        <tr><td width="150px">NAMA</td><td>: ${escapeHTML(studentData.studentName.toUpperCase())}</td></tr>
                        <tr><td>NIM</td><td>: ${escapeHTML(studentData.studentNim)}</td></tr>
                        <tr><td>PROGRAM STUDI</td><td>: ${escapeHTML(studentData.studentProdi.toUpperCase())}</td></tr>
                        <tr><td>BEASISWA</td><td>: ${escapeHTML(studentData.beasiswaText.toUpperCase())}</td></tr>
                        <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                    </table>
                    <table class="tabel-common" width="100%">
                        <thead>
                            <tr>
                                <th align="center">NO</th>
                                <th align="center">KODE MK</th>
                                <th align="center">MATA KULIAH</th>
                                <th align="center">W/P</th>
                                <th align="center">SKS</th>
                                <th align="center">NILAI</th>
                                <th align="center">BOBOT</th>
                                <th align="center">HASIL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courseRowsHTML}
                            <tr>
                                <th colspan="4" align="center">TOTAL</th>
                                <th>${courseData.totalSks.toFixed(2)}</th>
                                <th colspan="2"></th>
                                <th>${courseData.totalHasil.toFixed(2)}</th>
                            </tr>
                            <tr>
                                <th colspan="8" align="left"><font class="l3 lb">INDEKS PRESTASI (IP): ${escapeHTML(ipText)}</font></th>
                            </tr>
                            <tr>
                                <th colspan="8" align="left"><font class="l3 lb">Maksimal SKS Semester Berikutnya: ${escapeHTML(maksimalSksTeks)}</font></th>
                            </tr>
                        </tbody>
                    </table>
                    <br><br>
                    <table>
                        <tr>
                            <td width="230"></td>
                            <td width="230"></td>
                            <td width="230">Samarinda, ${getFormattedDate()}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>Wakil Dekan Bidang Kemahasiswaan, Alumni, dan Kerja Sama</td>
                        </tr>
                        <tr>
                            <td height="80"></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td><font class="lb lu">${escapeHTML(studentData.wakilDekanName)}</font></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>NIP: ${escapeHTML(studentData.wakilDekanNip)}</td>
                        </tr>
                    </table>
                </page>`;
  }

  function extractCourseData(source) {
    const courses = extractCourseRows(source);
    let totalSks = 0;
    let totalHasil = 0;

    const courseRowsHTML = courses
      .map((course, index) => {
        const sks = toNumber(course.sks);
        const hasil = toNumber(course.hasil);

        totalSks += sks;
        totalHasil += hasil;

        return `<tr>
                  <td align="center">${index + 1}</td>
                  <td>${escapeHTML(course.kodeMk || "-")}</td>
                  <td>${escapeHTML(course.namaMk || "-")}</td>
                  <td align="center">${escapeHTML(course.wp || "-")}</td>
                  <td align="center">${sks.toFixed(2)}</td>
                  <td align="center">${escapeHTML(course.nilai || "-")}</td>
                  <td align="center">${escapeHTML(course.bobot || "-")}</td>
                  <td align="right">${hasil.toFixed(2)}</td>
                </tr>`;
      })
      .join("\n");

    return {
      courses,
      courseRowsHTML,
      totalSks,
      totalHasil,
    };
  }

  function extractCourseRows(source) {
    const apiRows = Array.from(source.querySelectorAll("tbody > tr")).filter(
      (row) => row.querySelector("input.list-id-kelas"),
    );

    if (apiRows.length > 0) {
      return apiRows.map((row) => {
        const cells = getCells(row);
        const mainLine = getCellText(cells[2]).split("\n")[0].trim();
        let kodeMk = "N/A";
        let namaMk = mainLine;

        if (mainLine.includes(" - ")) {
          const parts = mainLine.split(" - ");
          kodeMk = parts.shift() || "N/A";
          namaMk = parts.join(" - ");
        }

        return {
          kodeMk: kodeMk.trim(),
          namaMk: namaMk.trim(),
          wp: getCellText(cells[3]) || "-",
          sks: getCellText(cells[4]) || "0",
          nilai: getCellText(cells[6]) || "-",
          bobot: getCellText(cells[7]) || "-",
          hasil: getCellText(cells[8]) || "0",
        };
      });
    }

    return Array.from(source.querySelectorAll("table tr"))
      .map((row) => getCells(row))
      .filter(
        (cells) => cells.length >= 8 && /^\d+\.?$/.test(getCellText(cells[0])),
      )
      .map((cells) => ({
        kodeMk: getCellText(cells[1]) || "N/A",
        namaMk: getCellText(cells[2]) || "-",
        wp: getCellText(cells[3]) || "-",
        sks: getCellText(cells[4]) || "0",
        nilai: getCellText(cells[5]) || "-",
        bobot: getCellText(cells[6]) || "-",
        hasil: getCellText(cells[7]) || "0",
      }))
      .filter((course) => {
        const combined = `${course.kodeMk} ${course.namaMk}`.toLowerCase();
        return (
          !combined.includes("kode mk") && !combined.includes("mata kuliah")
        );
      });
  }

  function generateEmbeddedCetakPage(document, selectedSemester) {
    const body = document.body?.cloneNode(true);
    if (!body) return "";

    body
      .querySelectorAll(
        "script, iframe, nav, header, footer, .sidebar-wrapper, .page-header, .tap-top, .bookmark-wrap, .loader-wrapper",
      )
      .forEach((element) => element.remove());

    const existingPage = body.querySelector("page");
    const content = existingPage
      ? existingPage.outerHTML
      : body.innerHTML.trim();
    if (!content) return "";

    return `<page class="khs-page embedded-khs">
              <div class="source-info">Sumber: halaman cetak AIS untuk ${escapeHTML(selectedSemester.nama)}</div>
              ${content}
            </page>`;
  }

  function extractIpText(source, fallbackIp) {
    const directIp = getCellText(source.querySelector("#ip"));
    if (directIp) return directIp;

    const allText = getCellText(source);
    const patterns = [
      /INDEKS\s+PRESTASI\s*\(IP\)\s*:?\s*([0-9]+(?:[,.][0-9]+)?)/i,
      /\bIPS\s*:?\s*([0-9]+(?:[,.][0-9]+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = allText.match(pattern);
      if (match) return match[1];
    }

    return fallbackIp || "0.00";
  }

  function generateErrorPage(semester, errorMessage) {
    return `<page class="khs-page">
                    <h1>Gagal Memuat KHS</h1>
                    <p>Semester: <strong>${escapeHTML(semester.nama)}</strong></p>
                    <p>${escapeHTML(errorMessage)}</p>
                    <p>Silakan cek halaman AIS, koneksi internet, atau jalankan ulang skrip untuk semester ini.</p>
                </page>`;
  }

  function writePrintableDocument(printWindow, pages, studentData) {
    const title = `Cetak KHS - ${studentData.studentName}`;
    const finalHTML = `<html>
                            <head>
                                <title>${escapeHTML(title)}</title>
                                <link rel="stylesheet" type="text/css" media="all" href="https://sia-arsip.unmul.ac.id/public/css/a_sia_cetak_media_print.css" />
                                <style>
                                    body { font-family: 'Times New Roman', Times, serif; background-color: #fff; margin: 0; padding: 0; }
                                    .tabel-common th, .tabel-common td { padding: 4px 6px; vertical-align: top; }
                                    .lu { text-transform: uppercase; }
                                    .l1 { font-size: 1.4em; }
                                    .l2 { font-size: 1.2em; }
                                    .l3 { font-size: 1.1em; }
                                    .lb { font-weight: bold; }
                                    .source-info { color: #555; font-family: Arial, sans-serif; font-size: 11px; margin-bottom: 8px; }
                                    .khs-page { display: block; page-break-after: always; break-after: page; }
                                    .khs-page:last-child { page-break-after: auto; break-after: auto; }
                                </style>
                            </head>
                            <body>
                                ${pages.join("\n")}
                            </body>
                        </html>`;

    printWindow.document.open();
    printWindow.document.write(finalHTML);
    printWindow.document.close();
  }

  function buildDetailUrl(cetakUrl, key) {
    if (cetakUrl && cetakUrl.includes("/mahasiswa/khs/cetak/")) {
      return cetakUrl.replace(
        "/mahasiswa/khs/cetak/",
        "/mahasiswa/khs/detail/",
      );
    }

    if (key) {
      return `${window.location.origin}/mahasiswa/khs/detail/${key}`;
    }

    return "";
  }

  function normalizeUrl(href) {
    if (!href) return "";

    try {
      return new URL(href, window.location.href).href;
    } catch (error) {
      console.warn(`⚠️ Gagal membaca URL: ${href}`, error);
      return "";
    }
  }

  function extractKeyFromCetakUrl(cetakUrl) {
    if (!cetakUrl) return "";

    const marker = "/mahasiswa/khs/cetak/";
    const markerIndex = cetakUrl.indexOf(marker);
    if (markerIndex === -1) return "";

    return cetakUrl
      .slice(markerIndex + marker.length)
      .split("?")[0]
      .split("#")[0];
  }

  function extractSemesterStats(element) {
    const badges = Array.from(element.querySelectorAll(".badge")).map((badge) =>
      badge.innerText.trim(),
    );

    return {
      sks: extractBadgeValue(badges, "SKS"),
      ips: extractBadgeValue(badges, "IPS"),
      totalSks: extractBadgeValue(badges, "T. SKS"),
      ipk: extractBadgeValue(badges, "IPK"),
    };
  }

  function extractBadgeValue(badgeTexts, label) {
    const normalizedLabel = label.toUpperCase();
    const badgeText = badgeTexts.find((text) =>
      text.toUpperCase().startsWith(normalizedLabel),
    );
    if (!badgeText) return "";

    const match = badgeText.match(/:\s*([^\n]+)/);
    return match ? match[1].trim() : "";
  }

  function getCells(row) {
    return Array.from(row?.querySelectorAll("th, td") || []);
  }

  function getCellText(element) {
    return (element?.innerText || element?.textContent || "").trim();
  }

  function stripHTML(value) {
    const html = String(value ?? "");
    if (!/<[^>]+>/.test(html)) return html.trim();

    const template = document.createElement("template");
    template.innerHTML = html;
    return getCellText(template.content).trim();
  }

  function toNumber(value) {
    const normalized = String(value || "0")
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");
    const number = parseFloat(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function getMaksimalSksText(ipValue) {
    if (ipValue >= 3.0) return "24 sks";
    if (ipValue >= 2.5) return "21 sks";
    if (ipValue >= 2.0) return "18 sks";
    if (ipValue >= 1.5) return "15 sks";
    return "12 sks";
  }

  function getFormattedDate() {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const today = new Date();
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
