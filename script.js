const KEYS = {
    favorites: "wardakFavorites",
    settings: "wardakSettings",
    progress: "wardakProgress",
    theme: "wardakDarkMode",
    streak: "wardakStreak"
};


export function getJSON(key, fallback) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) ?? fallback;

    } catch {

        return fallback;
    }
}


export function setJSON(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


export function getFavorites() {

    return getJSON(
        KEYS.favorites,
        []
    );
}


export function saveFavorites(value) {

    setJSON(
        KEYS.favorites,
        value
    );
}


/* =====================================================
   SETTINGS
===================================================== */

export function getSettings() {

    return getJSON(
        KEYS.settings,
        {
            reciter: "ar.minshawi",
            translation: "en.sahih",
            fontSize: 30
        }
    );
}


export function saveSettings(value) {

    setJSON(
        KEYS.settings,
        value
    );
}


/* =====================================================
   PROGRESS
===================================================== */

export function getProgress() {

    return getJSON(
        KEYS.progress,
        {
            surah: 1,
            ayah: 1,
            pages: 0
        }
    );
}


export function saveProgress(value) {

    setJSON(
        KEYS.progress,
        value
    );
}


/* =====================================================
   DARK MODE
===================================================== */

export function isDark() {

    return localStorage.getItem(
        KEYS.theme
    ) === "true";
}


export function setDark(value) {

    localStorage.setItem(
        KEYS.theme,
        String(value)
    );
}


/* =====================================================
   STREAK
===================================================== */

export function getStreak() {

    return Number(
        localStorage.getItem(
            KEYS.streak
        ) || 0
    );
}
export const API_BASE =
    "https://api.alquran.cloud/v1";


/* ===================================================== 
   RECITERS 
===================================================== */

export const RECITERS = {

    minshawi: {
        name: "محمد صديق المنشاوي",
        edition: "ar.minshawi"
    },

    minshawiMujawwad: {
        name: "محمد صديق المنشاوي - مجود",
        edition: "ar.minshawimujawwad"
    },

    abdulbasit: {
        name: "عبد الباسط عبد الصمد",
        edition: "ar.abdulbasit"
    },

    /* 
     * نضيف باقي القراء هنا فقط بعد التأكد 
     * من الـedition ID الرسمي الموجود في API. 
     */
};


/* ===================================================== 
   GENERIC API 
===================================================== */

export async function apiGet(path) {

    const response =
        await fetch(
            `${API_BASE}${path}`
        );


    if (!response.ok) {

        throw new Error(
            `API ${response.status}`
        );
    }


    const json =
        await response.json();


    if (json.code !== 200) {

        throw new Error(
            json.status || "API error"
        );
    }


    return json.data;
}


/* ===================================================== 
   SURAHS 
===================================================== */

export const getSurahs =
    () =>
        apiGet(
            "/surah"
        );


/* ===================================================== 
   SURAH 
===================================================== */

export const getSurah =
    (
        number,
        edition = "quran-uthmani"
    ) =>
        apiGet(
            `/surah/${number}/${edition}`
        );


/* ===================================================== 
   SEARCH 
===================================================== */

export const searchQuran =
    (
        query,
        edition = "quran-uthmani"
    ) =>
        apiGet(
            `/search/${encodeURIComponent(query)}/all/${edition}`
        );


/* ===================================================== 
   GET AVAILABLE AUDIO EDITIONS 
===================================================== */

export const getAudioEditions =
    () =>
        apiGet(
            "/edition/format/audio"
        );
import {
    getSettings,
    saveSettings,
    isDark,
    setDark,
    getProgress,
    getStreak
} from "./storage.js";

import {
    RECITERS
} from "./api.js";


const settings =
    getSettings();


document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme();

        setupGlobalActions();

        updateHome();
    }
);


/* ===================================================== 
   THEME 
===================================================== */

function applyTheme() {

    document.body.classList.toggle(
        "dark",
        isDark()
    );
}


/* ===================================================== 
   GLOBAL ACTIONS 
===================================================== */

function setupGlobalActions() {

    document
        .querySelectorAll(
            '[data-action="theme"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setDark(
                        !document.body.classList.contains(
                            "dark"
                        )
                    );

                    applyTheme();
                }
            );

        });


    document
        .querySelectorAll(
            '[data-action="settings"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                openSettings
            );

        });
}


/* ===================================================== 
   HOME 
===================================================== */

function updateHome() {

    const progress =
        getProgress();


    const percent =
        Math.min(
            100,
            Math.round(
                (progress.pages / 604) * 100
            )
        );


    const bar =
        document.getElementById(
            "khatmaBar"
        );


    if (bar) {

        bar.style.width =
            `${percent}%`;
    }


    const percentage =
        document.getElementById(
            "khatmaPercent"
        );


    if (percentage) {

        percentage.textContent =
            `${percent}%`;
    }


    const pages =
        document.getElementById(
            "pagesRead"
        );


    if (pages) {

        pages.textContent =
            `${progress.pages} من 604 صفحة`;
    }


    const streak =
        document.getElementById(
            "streak"
        );


    if (streak) {

        streak.textContent =
            getStreak();
    }
}


/* ===================================================== 
   SETTINGS 
===================================================== */

function openSettings() {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "settings-modal show";


    modal.innerHTML = ` 
 
        <div class="modal-box"> 
 
            <div class="modal-head"> 
 
                <h2> 
                    الإعدادات 
                </h2> 
 
                <button 
                    class="icon-btn" 
                    data-close 
                > 
                    ✕ 
                </button> 
 
            </div> 
 
 
            <!-- RECITER --> 
 
            <div class="setting"> 
 
                <label> 
                    القارئ 
                </label> 
 
 
                <select id="setReciter"> 
 
                    <option value="ar.minshawi"> 
 
                        محمد صديق المنشاوي 
 
                    </option> 
 
 
                    <option value="ar.minshawimujawwad"> 
 
                        محمد صديق المنشاوي - مجود 
 
                    </option> 
 
 
                    <option value="ar.abdulbasit"> 
 
                        عبد الباسط عبد الصمد 
 
                    </option> 
 
                </select> 
 
            </div> 
 
 
            <!-- TRANSLATION --> 
 
            <div class="setting"> 
 
                <label> 
                    الترجمة 
                </label> 
 
 
                <select id="setTranslation"> 
 
                    <option value="en.sahih"> 
 
                        English - Sahih International 
 
                    </option> 
 
 
                    <option value="en.pickthall"> 
 
                        English - Pickthall 
 
                    </option> 
 
                </select> 
 
            </div> 
 
 
            <!-- FONT --> 
 
            <div class="setting"> 
 
                <label> 
                    حجم الخط 
                </label> 
 
 
                <input 
                    id="setFont" 
                    type="range" 
                    min="22" 
                    max="48" 
                    value="${settings.fontSize}" 
                > 
 
            </div> 
 
 
            <button 
                class="btn btn-primary" 
                id="saveSet" 
                style="width:100%" 
            > 
 
                حفظ الإعدادات 
 
            </button> 
 
        </div> 
    `;


    document.body.appendChild(
        modal
    );


    modal.querySelector(
        "#setReciter"
    ).value =
        settings.reciter;


    modal.querySelector(
        "#setTranslation"
    ).value =
        settings.translation;


    modal.querySelector(
        "[data-close]"
    ).onclick =
        () => modal.remove();


    modal.onclick =
        event => {

            if (
                event.target === modal
            ) {

                modal.remove();
            }
        };


    modal.querySelector(
        "#saveSet"
    ).onclick =
        () => {


            saveSettings({

                reciter:
                    modal.querySelector(
                        "#setReciter"
                    ).value,


                translation:
                    modal.querySelector(
                        "#setTranslation"
                    ).value,


                fontSize:
                    Number(
                        modal.querySelector(
                            "#setFont"
                        ).value
                    )

            });


            modal.remove();


            toast(
                "تم حفظ الإعدادات ✓"
            );
        };
}


/* ===================================================== 
   TOAST 
===================================================== */

export function toast(message) {

    const toastElement =
        document.createElement(
            "div"
        );


    toastElement.className =
        "toast show";


    toastElement.textContent =
        message;


    document.body.appendChild(
        toastElement
    );


    setTimeout(
        () =>
            toastElement.remove(),
        2200
    );
}
import {
    getSurahs
} from "./api.js";

import {
    isDark,
    setDark
} from "./storage.js";


let surahs = [];


document.addEventListener(
    "DOMContentLoaded",
    async () => {


        document.body.classList.toggle(
            "dark",
            isDark()
        );


        const themeButton =
            document.querySelector(
                '[data-action="theme"]'
            );


        if (themeButton) {

            themeButton.onclick =
                () => {

                    setDark(
                        !document.body.classList.contains(
                            "dark"
                        )
                    );


                    document.body.classList.toggle(
                        "dark"
                    );
                };
        }


        const search =
            document.getElementById(
                "surahSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                filter
            );
        }


        try {

            surahs =
                await getSurahs();


            render(
                surahs
            );


        } catch {

            const grid =
                document.getElementById(
                    "surahGrid"
                );


            if (grid) {

                grid.innerHTML = ` 
 
                    <div class="empty"> 
 
                        تعذر تحميل السور. 
 
                        تأكد من اتصال الإنترنت. 
 
                    </div> 
 
                `;
            }
        }
    }
);


/* ===================================================== 
   FILTER 
===================================================== */

function filter(event) {

    const query =
        event.target.value
            .trim()
            .toLowerCase();


    render(

        surahs.filter(

            surah =>

                surah.name.includes(
                    query
                )

                ||

                surah.englishName
                    .toLowerCase()
                    .includes(
                        query
                    )
        )

    );
}


/* ===================================================== 
   RENDER 
===================================================== */

function render(list) {

    const container =
        document.getElementById(
            "surahGrid"
        );


    if (!container)
        return;


    container.innerHTML = "";


    list.forEach(
        surah => {


            const element =
                document.createElement(
                    "a"
                );


            element.className =
                "surah-card";


            element.href =
                `reader.html?surah=${surah.number}`;


            element.innerHTML = ` 
 
                <span class="surah-number"> 
 
                    ${surah.number} 
 
                </span> 
 
 
                <span class="surah-info"> 
 
                    <h3> 
 
                        ${surah.name} 
 
                    </h3> 
 
 
                    <p> 
 
                        ${surah.englishName} 
 
                        • 
 
                        ${surah.numberOfAyahs} 
 
                        آية 
 
                    </p> 
 
                </span> 
 
 
                <span class="surah-arabic"> 
 
                    ${surah.name} 
 
                </span> 
 
            `;


            container.appendChild(
                element
            );
        }
    );
} 