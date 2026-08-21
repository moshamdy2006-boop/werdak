/* =====================================================
   WARDAK - STORAGE
   حفظ بيانات الموقع داخل المتصفح
===================================================== */

const STORAGE_KEY = "wardakData";

const DEFAULT_DATA = {
    plan: null,
    completedDays: [],
    streak: 0,
    lastCompletedDate: null,
    startDate: null
};

export function getWardakData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return { ...DEFAULT_DATA, completedDays: [] };
        }
        const data = JSON.parse(saved);
        return {
            ...DEFAULT_DATA,
            ...data,
            completedDays: Array.isArray(data.completedDays) ? data.completedDays : []
        };
    } catch (error) {
        console.error("Wardak storage error:", error);
        return { ...DEFAULT_DATA, completedDays: [] };
    }
}

export function saveWardakData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Wardak save error:", error);
    }
}

export function getPlan() {
    const data = getWardakData();
    return data.plan;
}

export function savePlan(days) {
    const data = getWardakData();
    data.plan = Number(days);
    if (!data.startDate) {
        data.startDate = getTodayDate();
    }
    saveWardakData(data);
}

export function clearPlan() {
    const data = getWardakData();
    data.plan = null;
    data.startDate = null;
    saveWardakData(data);
}

export function getCompletedDays() {
    const data = getWardakData();
    return data.completedDays;
}

export function saveCompletedDays(days) {
    const data = getWardakData();
    data.completedDays = Array.isArray(days) ? days : [];
    saveWardakData(data);
}

export function addCompletedDay(dayNumber) {
    const data = getWardakData();
    dayNumber = Number(dayNumber);
    if (!data.completedDays.includes(dayNumber)) {
        data.completedDays.push(dayNumber);
        data.completedDays.sort((a, b) => a - b);
        saveWardakData(data);
    }
    return data.completedDays;
}

export function isDayCompleted(dayNumber) {
    const days = getCompletedDays();
    return days.includes(Number(dayNumber));
}

export function getStreak() {
    const data = getWardakData();
    return Number(data.streak || 0);
}

export function saveStreak(value) {
    const data = getWardakData();
    data.streak = Number(value);
    saveWardakData(data);
}

export function getLastCompletedDate() {
    const data = getWardakData();
    return data.lastCompletedDate;
}

export function saveLastCompletedDate(date) {
    const data = getWardakData();
    data.lastCompletedDate = date;
    saveWardakData(data);
}

export function getProgress() {
    const data = getWardakData();
    const completed = data.completedDays.length;
    const percentage = data.plan
        ? Math.min(100, Math.round((completed / data.plan) * 100))
        : 0;

    return {
        days: completed,
        total: data.plan || 0,
        percent: percentage
    };
}

export function saveProgress(progress) {
    return progress;
}

export function getTheme() {
    return localStorage.getItem("wardakTheme") || "light";
}

export function saveTheme(theme) {
    localStorage.setItem("wardakTheme", theme);
}

export function getSettings() {
    try {
        const saved = localStorage.getItem("wardakSettings");
        if (!saved) {
            return { reciter: "ar.minshawi", fontSize: 30, translation: "en.sahih" };
        }
        return JSON.parse(saved);
    } catch (error) {
        console.error("Settings storage error:", error);
        return { reciter: "ar.minshawi", fontSize: 30, translation: "en.sahih" };
    }
}

export function saveSettings(settings) {
    localStorage.setItem("wardakSettings", JSON.stringify(settings));
}

export function resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("wardakTheme");
    localStorage.removeItem("wardakSettings");
}

export function getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function updateStreak() {
    const data = getWardakData();
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const lastDate = data.lastCompletedDate;

    if (!lastDate) {
        data.streak = 1;
        data.lastCompletedDate = today;
        saveWardakData(data);
        return data.streak;
    }

    if (lastDate === today) return data.streak;

    if (lastDate === yesterday) {
        data.streak += 1;
    } else {
        data.streak = 1;
    }

    data.lastCompletedDate = today;
    saveWardakData(data);
    return data.streak;
}

window.WardakStorage = {
    getWardakData, saveWardakData, getPlan, savePlan, clearPlan,
    getCompletedDays, saveCompletedDays, addCompletedDay, isDayCompleted,
    getStreak, saveStreak, getLastCompletedDate, saveLastCompletedDate,
    getProgress, saveProgress, getTheme, saveTheme, getSettings,
    saveSettings, resetAllData, getTodayDate, getYesterdayDate, updateStreak
};