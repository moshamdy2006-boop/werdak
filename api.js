/* =====================================================
   WARDAK - QURAN API
   API: AlQuran.cloud
===================================================== */

const API_BASE = "https://api.alquran.cloud/v1";

/* =====================================================
   GENERIC API REQUEST
===================================================== */

async function apiGet(endpoint) {

    try {

        const response = await fetch(
            `${API_BASE}${endpoint}`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const result = await response.json();

        if (result.code !== 200) {
            throw new Error(
                result.status || "API Error"
            );
        }

        return result.data;

    } catch (error) {

        console.error(
            "Quran API Error:",
            error
        );

        throw error;
    }
}


/* =====================================================
   GET ALL SURAHS
===================================================== */

export async function getSurahs() {

    return await apiGet(
        "/surah"
    );
}


/* =====================================================
   GET ONE SURAH
===================================================== */

export async function getSurah(
    surahNumber,
    edition = "quran-uthmani"
) {

    return await apiGet(
        `/surah/${surahNumber}/${edition}`
    );
}


/* =====================================================
   GET SURAH WITH TRANSLATION
===================================================== */

export async function getSurahWithTranslation(
    surahNumber,
    translation = "en.sahih"
) {

    const arabic =
        await getSurah(
            surahNumber,
            "quran-uthmani"
        );

    const translated =
        await getSurah(
            surahNumber,
            translation
        );

    return {
        arabic,
        translated
    };
}


/* =====================================================
   SEARCH QURAN
===================================================== */

export async function searchQuran(
    query,
    edition = "quran-uthmani"
) {

    if (!query || !query.trim()) {
        return null;
    }

    return await apiGet(
        `/search/${encodeURIComponent(
            query.trim()
        )}/all/${edition}`
    );
}


/* =====================================================
   AUDIO EDITIONS
===================================================== */

export async function getAudioEditions() {

    return await apiGet(
        "/edition/format/audio"
    );
}


/* =====================================================
   GET SURAH AUDIO
===================================================== */

export async function getSurahAudio(
    surahNumber,
    reciter = "ar.minshawi"
) {

    return await getSurah(
        surahNumber,
        reciter
    );
}


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
    }

};


/* =====================================================
   TRANSLATIONS
===================================================== */

export const TRANSLATIONS = {

    sahih: {
        name: "Sahih International",
        edition: "en.sahih"
    },

    pickthall: {
        name: "Pickthall",
        edition: "en.pickthall"
    }

};


/* =====================================================
   SURAH PAGE COUNT
===================================================== */

export const TOTAL_QURAN_PAGES = 604;


/* =====================================================
   API STATUS TEST
===================================================== */

export async function testAPI() {

    try {

        await apiGet("/surah");

        return true;

    } catch {

        return false;

    }

}