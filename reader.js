import { getSurah } from "./api.js";
import { getSettings, saveSettings } from "./storage.js";

/* =====================================================
   GLOBAL VARIABLES
===================================================== */
let currentSurah = null;
let currentTafsir = null;
let currentAyah = 0;
let audio = null;
let isPlaying = false;

const params = new URLSearchParams(window.location.search);
const surahNumber = Number(params.get("surah") || 1);

/* =====================================================
   START
===================================================== */
document.addEventListener("DOMContentLoaded", initReader);

async function initReader() {
    try {
        setupControls();
        applySettings();
        await loadSurahAndTafsir();
    } catch (error) {
        console.error(error);
        showError("تعذر تحميل السورة. تأكد من اتصال الإنترنت.");
    }
}

/* =====================================================
   LOAD SURAH & TAFSIR
===================================================== */
async function loadSurahAndTafsir() {
    showLoading();
    try {
        const [surahData, tafsirData] = await Promise.all([
            getSurah(surahNumber, "quran-uthmani"),
            getSurah(surahNumber, "ar.muyassar")
        ]);

        currentSurah = surahData;
        currentTafsir = tafsirData;

        renderSurah(currentSurah);
        updateReaderTitle(currentSurah);
        hideLoading();
    } catch (error) {
        showError("حدث خطأ أثناء تحميل السورة");
    }
}

/* =====================================================
   RENDER SURAH (مع زر التفسير المضاف)
===================================================== */
function renderSurah(surah) {
    const container = document.getElementById("ayahContainer");
    if (!container) return;
    container.innerHTML = "";

    if (surah.number !== 9 && surah.number !== 1) {
        const bismillah = document.createElement("div");
        bismillah.className = "bismillah-reader";
        bismillah.textContent = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
        container.appendChild(bismillah);
    }

    surah.ayahs.forEach((ayah, index) => {
        const article = document.createElement("article");
        article.className = "quran-ayah";
        article.dataset.ayah = ayah.numberInSurah;

        article.innerHTML = `
            <div class="ayah-text-reader">
                ${ayah.text}
                <span class="ayah-number-reader">${ayah.numberInSurah}</span>
            </div>
            <div class="ayah-actions-reader">
                <button class="ayah-action-reader play-ayah" title="تشغيل" data-index="${index}">▶</button>
                <button class="ayah-action-reader tafsir-ayah" title="التفسير" data-index="${index}">📖</button>
                <button class="ayah-action-reader copy-ayah" title="نسخ" data-index="${index}">⧉</button>
            </div>
        `;
        container.appendChild(article);
    });

    setupAyahButtons();
}

/* =====================================================
   READER TITLE
===================================================== */
function updateReaderTitle(surah) {
    const title = document.getElementById("surahName");
    if (title) title.textContent = surah.name;

    const info = document.getElementById("surahInfo");
    if (info) info.textContent = `${surah.englishName} • ${surah.numberOfAyahs} آية`;
}

/* =====================================================
   AYAH BUTTONS
===================================================== */
function setupAyahButtons() {
    document.querySelectorAll(".play-ayah").forEach(button => {
        button.addEventListener("click", () => {
            playAyah(Number(button.dataset.index));
        });
    });

    document.querySelectorAll(".copy-ayah").forEach(button => {
        button.addEventListener("click", () => {
            copyAyah(Number(button.dataset.index));
        });
    });

    // تفعيل زر التفسير
    document.querySelectorAll(".tafsir-ayah").forEach(button => {
        button.addEventListener("click", () => {
            showTafsir(Number(button.dataset.index));
        });
    });
}

/* =====================================================
   TAFSIR LOGIC
===================================================== */
function showTafsir(index) {
    const tafsirModal = document.getElementById("tafsirModal");
    const tafsirText = document.getElementById("tafsirText");
    const tafsirAyahNumber = document.getElementById("tafsirAyahNumber");

    if (currentTafsir && currentTafsir.ayahs[index]) {
        tafsirText.textContent = currentTafsir.ayahs[index].text;
        tafsirAyahNumber.textContent = `الآية ${currentSurah.ayahs[index].numberInSurah}`;
    } else {
        tafsirText.textContent = "عذراً، التفسير غير متوفر حالياً.";
    }

    if (tafsirModal) tafsirModal.classList.add("show");
}

/* =====================================================
   PLAY AYAH
===================================================== */
async function playAyah(index) {
    if (!currentSurah || !currentSurah.ayahs[index]) return;
    const settings = getSettings();
    const ayah = currentSurah.ayahs[index];
    currentAyah = index;

    if (audio) {
        audio.pause();
        audio = null;
    }

    let audioUrl = ayah.audio;
    if (!audioUrl) {
        try {
            const audioSurah = await getSurah(surahNumber, settings.reciter);
            if (audioSurah && audioSurah.ayahs && audioSurah.ayahs[index]) {
                audioUrl = audioSurah.ayahs[index].audio;
            }
        } catch (error) { console.error(error); }
    }

    if (!audioUrl) {
        showToast("تعذر تشغيل التلاوة");
        return;
    }

    audio = document.getElementById("quranAudio") || new Audio();
    audio.src = audioUrl;

    audio.onplay = () => {
        isPlaying = true;
        highlightAyah(index);
        updateAudioDock(ayah);
    };

    audio.onended = () => {
        isPlaying = false;
        const next = index + 1;
        if (next < currentSurah.ayahs.length) {
            playAyah(next);
        }
    };

    audio.onerror = () => {
        isPlaying = false;
        showToast("حدث خطأ أثناء تشغيل الصوت");
    };

    audio.play();
}

function highlightAyah(index) {
    document.querySelectorAll(".quran-ayah").forEach(el => el.classList.remove("playing"));
    const target = document.querySelector(`.quran-ayah[data-ayah="${currentSurah.ayahs[index].numberInSurah}"]`);
    if (target) {
        target.classList.add("playing");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

async function copyAyah(index) {
    const ayah = currentSurah.ayahs[index];
    const text = `${ayah.text} ﴿${ayah.numberInSurah}﴾`;
    try {
        await navigator.clipboard.writeText(text);
        showToast("تم نسخ الآية ✓");
    } catch {
        showToast("تعذر نسخ الآية");
    }
}

function updateAudioDock(ayah) {
    const audioSurah = document.getElementById("audioSurah");
    if (audioSurah) audioSurah.textContent = currentSurah.name;

    const audioReciter = document.getElementById("audioReciter");
    if (audioReciter) audioReciter.textContent = `الآية ${ayah.numberInSurah}`;
}

/* =====================================================
   SETTINGS & CONTROLS
===================================================== */
function applySettings() {
    const settings = getSettings();
    document.documentElement.style.setProperty("--ayah-size", `${settings.fontSize}px`);
    const fontSizeValue = document.getElementById("fontSizeValue");
    if (fontSizeValue) fontSizeValue.textContent = settings.fontSize;
    document.body.classList.toggle("dark", settings.theme === "dark");
}

function setupControls() {
    const button = document.getElementById("audioPlay");
    if (button) {
        button.addEventListener("click", () => {
            if (!audio) {
                playAyah(currentAyah);
                return;
            }
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
            } else {
                audio.play();
                isPlaying = true;
            }
        });
    }

    const increase = document.getElementById("increaseFont");
    if (increase) {
        increase.onclick = () => {
            const settings = getSettings();
            settings.fontSize = Math.min(48, settings.fontSize + 2);
            saveSettings(settings);
            applySettings();
        };
    }

    const decrease = document.getElementById("decreaseFont");
    if (decrease) {
        decrease.onclick = () => {
            const settings = getSettings();
            settings.fontSize = Math.max(22, settings.fontSize - 2);
            saveSettings(settings);
            applySettings();
        };
    }

    // إغلاق نافذة التفسير
    const closeTafsir = document.getElementById("closeTafsir");
    const tafsirOverlay = document.getElementById("tafsirOverlay");
    const tafsirModal = document.getElementById("tafsirModal");

    if (closeTafsir) closeTafsir.onclick = () => tafsirModal.classList.remove("show");
    if (tafsirOverlay) tafsirOverlay.onclick = () => tafsirModal.classList.remove("show");

    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettings = document.getElementById("closeSettings");
    const settingsOverlay = document.getElementById("settingsOverlay");

    if (settingsBtn && settingsModal) {
        settingsBtn.onclick = () => settingsModal.classList.add("show");
    }
    if (closeSettings) closeSettings.onclick = () => settingsModal.classList.remove("show");
    if (settingsOverlay) settingsOverlay.onclick = () => settingsModal.classList.remove("show");

    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle("dark");
            const settings = getSettings();
            settings.theme = document.body.classList.contains("dark") ? "dark" : "light";
            saveSettings(settings);
            localStorage.setItem("wardakTheme", settings.theme);
        };
    }
}

/* =====================================================
   LOADING & ERROR
===================================================== */
function showLoading() {
    const loader = document.getElementById("readerLoading");
    if (loader) loader.style.display = "flex";
}

function hideLoading() {
    const loader = document.getElementById("readerLoading");
    if (loader) loader.style.display = "none";
}

function showError(message) {
    hideLoading();
    const errorDiv = document.getElementById("readerError");
    if (errorDiv) {
        errorDiv.style.display = "block";
        errorDiv.querySelector("p").textContent = message;
    }
}

function showToast(message) {
    let toast = document.getElementById("readerToast");
    if (toast) {
        document.getElementById("readerToastMessage").textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2200);
    }
}