/* =========================================================
   وِردك - SCRIPT.JS
   الخطط + الورد + الأيام + Streak + البحث
   + الوضع الليلي + حفظ البيانات
========================================================= */

/* =========================================================
   STORAGE
========================================================= */
const STORAGE_KEY = "wardakData";

const DEFAULT_DATA = {
    plan: null,
    completedDays: [],
    streak: 0,
    lastCompletedDate: null,
    startDate: null
};

/* =========================================================
   GET DATA
========================================================= */
function getData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return {
                ...DEFAULT_DATA
            };
        }
        const data = JSON.parse(saved);
        return {
            ...DEFAULT_DATA,
            ...data
        };
    } catch (error) {
        console.error("Wardak storage error:", error);
        return {
            ...DEFAULT_DATA
        };
    }
}

/* =========================================================
   SAVE DATA
========================================================= */
function saveData(data) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

/* =========================================================
   TODAY DATE
========================================================= */
function todayKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/* =========================================================
   DATE DIFFERENCE
========================================================= */
function dateDifference(date1, date2) {
    const first = new Date(`${date1}T00:00:00`);
    const second = new Date(`${date2}T00:00:00`);
    const difference = Math.abs(second - first);
    return Math.floor(difference / (1000 * 60 * 60 * 24));
}

/* =========================================================
   QURAN DATA
========================================================= */
const TOTAL_PAGES = 604;

/* =========================================================
   DAILY WIRD
========================================================= */
function calculateWird(planDays) {
    if (!planDays) {
        return 0;
    }
    return Math.ceil(TOTAL_PAGES / planDays);
}

/* =========================================================
   TODAY NUMBER
========================================================= */
function getTodayNumber(data) {
    if (!data.plan) {
        return 0;
    }
    return Math.min(
        data.plan,
        data.completedDays.length + 1
    );
}

/* =========================================================
   UPDATE STREAK
========================================================= */
function updateStreakBeforeDisplay() {
    const data = getData();
    if (!data.lastCompletedDate) {
        return data;
    }
    const today = todayKey();
    const difference = dateDifference(data.lastCompletedDate, today);

    /* لو مر أكثر من يوم من آخر ورد مكتمل */
    if (difference > 1) {
        data.streak = 0;
        saveData(data);
    }
    return data;
}

/* =========================================================
   PAGE LOAD
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    initializeYear();
    initializeMobileMenu();
    initializePlans();
    initializeCompleteButton();
    initializeChangePlan();
    initializeAskQuran();
    initializeSuggestions();
    initializeTheme();
    updateAll();
});

/* =========================================================
   UPDATE EVERYTHING
========================================================= */
function updateAll() {
    updateDashboard();
    updateCurrentPlan();
    updateTodayWird();
    updateHero();
}

/* =========================================================
   YEAR
========================================================= */
function initializeYear() {
    const year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

/* =========================================================
   MOBILE MENU 
========================================================= */
function initializeMobileMenu() {
    const button = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        menu.classList.toggle("active");
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
        });
    });
}

/* =========================================================
   PLANS
========================================================= */
function initializePlans() {
    const plans = document.querySelectorAll(".plan-card");

    plans.forEach(card => {
        card.addEventListener("click", () => {
            const days = Number(card.dataset.plan);
            selectPlan(days);
        });
    });
}

/* =========================================================
   SELECT PLAN
========================================================= */
function selectPlan(days) {
    if (![30, 60, 90].includes(days)) {
        return;
    }

    const data = getData();

    /* لو أول مرة يختار خطة */
    if (!data.plan) {
        data.plan = days;
        data.startDate = todayKey();
    }
    /* لو بيغير الخطة */
    else {
        const confirmChange = confirm("هل تريد تغيير خطة الختم؟\n\nسيتم الاحتفاظ بالأيام التي أكملتها.");
        if (!confirmChange) {
            return;
        }
        data.plan = days;
    }

    saveData(data);
    showToast(`تم اختيار ختمة ${days} يومًا ✓`);
    updateAll();

    setTimeout(() => {
        const section = document.querySelector(".today-section");
        if (section) {
            section.scrollIntoView({
                behavior: "smooth"
            });
        }
    }, 300);
}

/* =========================================================
   CURRENT PLAN
========================================================= */
function updateCurrentPlan() {
    const data = updateStreakBeforeDisplay();

    const title = document.getElementById("currentPlanTitle");
    const percent = document.getElementById("progressPercent");
    const fill = document.getElementById("progressFill");
    const days = document.getElementById("progressDays");
    const remaining = document.getElementById("remainingDays");

    if (!data.plan) {
        if (title) title.textContent = "لم تختر خطة بعد";
        if (percent) percent.textContent = "0%";
        if (fill) fill.style.width = "0%";
        if (days) days.textContent = "0 من 0 يوم";
        if (remaining) remaining.textContent = "متبقي 0 يوم";
        return;
    }

    const completed = Math.min(data.completedDays.length, data.plan);
    const percentage = Math.min(100, Math.round((completed / data.plan) * 100));
    const remainingDays = Math.max(0, data.plan - completed);

    if (title) title.textContent = `ختمة في ${data.plan} يومًا`;
    if (percent) percent.textContent = `${percentage}%`;
    if (fill) fill.style.width = `${percentage}%`;
    if (days) days.textContent = `${completed} من ${data.plan} يوم`;
    if (remaining) remaining.textContent = `متبقي ${remainingDays} يوم`;
}

/* =========================================================
   TODAY WIRD
========================================================= */
function updateTodayWird() {
    const data = updateStreakBeforeDisplay();

    const title = document.getElementById("todayTitle");
    const description = document.getElementById("todayDescription");
    const number = document.getElementById("todayNumber");
    const pages = document.getElementById("todayPages");
    const status = document.getElementById("todayStatus");
    const button = document.getElementById("completeBtn");

    if (!data.plan) {
        if (title) title.textContent = "ابدأ رحلتك باختيار خطة";
        if (description) description.textContent = "عندما تختار خطة، سيظهر هنا وردك اليومي تلقائيًا.";
        if (number) number.textContent = "-";
        if (pages) pages.textContent = "-";
        if (status) status.textContent = "لم يبدأ";
        if (button) {
            button.disabled = true;
            button.style.opacity = "0.5";
        }
        return;
    }

    const today = getTodayNumber(data);
    const dailyPages = calculateWird(data.plan);
    const alreadyCompleted = data.completedDays.includes(today);

    /* الختمة انتهت */
    if (data.completedDays.length >= data.plan) {
        if (title) title.textContent = "أتممت الختمة بحمد الله 🎉";
        if (description) description.textContent = "ما شاء الله، أنهيت رحلتك مع القرآن.";
        if (number) number.textContent = data.plan;
        if (pages) pages.textContent = "تمت الختمة";
        if (status) status.textContent = "مكتمل ✓";
        if (button) {
            button.disabled = true;
            button.style.opacity = "0.65";
            button.innerHTML = "<span>✓</span> تمت الختمة";
        }
        return;
    }

    if (title) title.textContent = `ورد اليوم — اليوم ${today}`;
    if (description) description.textContent = `وردك اليومي حوالي ${dailyPages} صفحة من القرآن الكريم.`;
    if (number) number.textContent = today;
    if (pages) pages.textContent = `${dailyPages} صفحة`;

    if (alreadyCompleted) {
        if (status) status.textContent = "تم بحمد الله ✓";
        if (button) {
            button.disabled = true;
            button.style.opacity = "0.65";
            button.innerHTML = "<span>✓</span> تم إكمال ورد اليوم";
        }
    } else {
        if (status) status.textContent = "لم يبدأ";
        if (button) {
            button.disabled = false;
            button.style.opacity = "1";
            button.innerHTML = "<span>✓</span> أكملت وردي اليوم";
        }
    }
}

/* =========================================================
   COMPLETE BUTTON
========================================================= */
function initializeCompleteButton() {
    const button = document.getElementById("completeBtn");
    if (!button) return;
    button.addEventListener("click", completeToday);
}

/* =========================================================
   COMPLETE TODAY
========================================================= */
function completeToday() {
    const data = getData();

    if (!data.plan) {
        showToast("اختر خطة أولًا");
        return;
    }

    const todayNumber = getTodayNumber(data);

    if (data.completedDays.includes(todayNumber)) {
        showToast("لقد أكملت ورد اليوم بالفعل ✓");
        return;
    }

    data.completedDays.push(todayNumber);
    const today = todayKey();

    if (!data.lastCompletedDate) {
        data.streak = 1;
    } else {
        const difference = dateDifference(data.lastCompletedDate, today);
        if (difference === 1) {
            data.streak += 1;
        } else if (difference === 0) {
            /* نفس اليوم */
        } else {
            data.streak = 1;
        }
    }

    data.lastCompletedDate = today;

    if (data.completedDays.length > data.plan) {
        data.completedDays = data.completedDays.slice(0, data.plan);
    }

    saveData(data);
    showToast("ما شاء الله، تم إكمال ورد اليوم ✓");

    // مؤثرات التهنئة عند إكمال الورد
    if (typeof confetti === "function") {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#0d6b50', '#c79b4b', '#ffffff']
        });
    }

    updateAll();

    if (data.completedDays.length >= data.plan) {
        setTimeout(() => {
            showToast("🎉 ما شاء الله! أتممت الختمة");
        }, 900);
    }
}

/* =========================================================
   CHANGE PLAN
========================================================= */
function initializeChangePlan() {
    const button = document.getElementById("changePlanBtn");
    if (!button) return;
    button.addEventListener("click", () => {
        const section = document.getElementById("plan");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    });
}

/* =========================================================
   DASHBOARD
========================================================= */
function updateDashboard() {
    const data = updateStreakBeforeDisplay();

    const days = document.getElementById("statDays");
    const streak = document.getElementById("statStreak");
    const goal = document.getElementById("statGoal");
    const progress = document.getElementById("statProgress");

    const completed = data.completedDays.length;
    const percentage = data.plan
        ? Math.min(100, Math.round((completed / data.plan) * 100))
        : 0;

    if (days) days.textContent = completed;
    if (streak) streak.textContent = data.streak;
    if (goal) goal.textContent = data.plan ? `${data.plan} يوم` : "--";
    if (progress) progress.textContent = `${percentage}%`;
}

/* =========================================================
   HERO
========================================================= */
function updateHero() {
    const data = getData();

    const title = document.getElementById("heroSurah");
    const text = document.getElementById("heroAyah");
    const progress = document.getElementById("heroProgress");
    const progressText = document.getElementById("heroProgressText");

    if (!data.plan) {
        if (title) title.textContent = "ابدأ رحلتك";
        if (text) text.textContent = "اختر خطة الختم الخاصة بك";
        if (progress) progress.style.width = "0%";
        if (progressText) progressText.textContent = "0%";
        return;
    }

    const completed = data.completedDays.length;
    const percentage = Math.min(100, Math.round((completed / data.plan) * 100));
    const today = Math.min(data.plan, completed + 1);

    if (title) title.textContent = `اليوم ${today} من ${data.plan}`;
    if (text) {
        text.textContent = completed >= data.plan
            ? "أتممت الختمة بحمد الله 🎉"
            : "استمر، خطوة صغيرة كل يوم";
    }
    if (progress) progress.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}%`;
}

/* =========================================================
   ASK QURAN
========================================================= */
function initializeAskQuran() {
    const button = document.getElementById("askBtn");
    const input = document.getElementById("askInput");

    if (!button || !input) return;

    button.addEventListener("click", searchQuranTopic);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchQuranTopic();
        }
    });
}

/* =========================================================
   SUGGESTIONS
========================================================= */
function initializeSuggestions() {
    const buttons = document.querySelectorAll(".suggestion");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById("askInput");
            if (!input) return;
            input.value = button.textContent.trim();
            searchQuranTopic();
        });
    });
}

/* =========================================================
   ASK SEARCH
========================================================= */
function searchQuranTopic() {
    const input = document.getElementById("askInput");
    const result = document.getElementById("askResult");

    if (!input || !result) return;

    const query = input.value.trim().toLowerCase();

    if (!query) {
        result.innerHTML = `
            <div class="ask-message">
                اكتب شعورًا أو موضوعًا تريد البحث عنه أولًا.
            </div>
        `;
        result.classList.add("show");
        return;
    }

    const topic = detectTopic(query);

    result.innerHTML = `
        <div class="ask-result-card">
            <div class="result-icon">۞</div>
            <div>
                <h3>آيات حول ${topic.title}</h3>
                <p>يمكنك قراءة هذه المواضع والتدبر فيها:</p>
                <div class="verse-suggestions">
                    ${topic.verses.map(verse => `<span>${verse}</span>`).join("")}
                </div>
                <a href="reader.html?surah=${topic.surah}" class="btn btn-primary" style="margin-top: 15px;">
                    قراءة السورة ←
                </a>
            </div>
        </div>
    `;

    result.classList.add("show");

    setTimeout(() => {
        result.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
}

/* =========================================================
   TOPIC DETECTION
========================================================= */
function detectTopic(text) {
    const query = text.toLowerCase().replace(/أ|إ|آ/g, "ا");

    if (query.includes("قلق") || query.includes("خوف") || query.includes("طمأن") || query.includes("سكين") || query.includes("راحة") || query.includes("حزن") || query.includes("حزين") || query.includes("ضيق") || query.includes("هم")) {
        return { title: "الطمأنينة والسكينة", surah: 13, verses: ["الرعد: 28", "الشرح: 5-6", "البقرة: 286"] };
    }
    if (query.includes("صبر") || query.includes("اصبر") || query.includes("تحمل") || query.includes("ابتلاء")) {
        return { title: "الصبر والثبات", surah: 2, verses: ["البقرة: 153", "البقرة: 286", "الزمر: 10"] };
    }
    if (query.includes("توب") || query.includes("ذنب") || query.includes("ذنوب") || query.includes("مغفر") || query.includes("معص")) {
        return { title: "التوبة والمغفرة", surah: 39, verses: ["الزمر: 53", "الفرقان: 70", "التحريم: 8"] };
    }
    if (query.includes("شكر") || query.includes("نعمه") || query.includes("نعم")) {
        return { title: "الشكر والنعم", surah: 14, verses: ["إبراهيم: 7", "النحل: 18", "الضحى: 11"] };
    }
    if (query.includes("رزق") || query.includes("مال") || query.includes("فقر") || query.includes("فلوس") || query.includes("عمل")) {
        return { title: "الرزق والتوكل", surah: 51, verses: ["الذاريات: 58", "هود: 6", "الطلاق: 2-3"] };
    }
    if (query.includes("هدا") || query.includes("طريق") || query.includes("ضلال") || query.includes("صح")) {
        return { title: "الهداية والثبات", surah: 1, verses: ["الفاتحة: 6", "البقرة: 2", "الأنعام: 153"] };
    }
    if (query.includes("امل") || query.includes("ياس") || query.includes("مستقبل") || query.includes("احباط") || query.includes("فشل")) {
        return { title: "الأمل وعدم اليأس", surah: 39, verses: ["الزمر: 53", "يوسف: 87", "الشرح: 5-6"] };
    }
    if (query.includes("حب") || query.includes("محبه")) {
        return { title: "المحبة", surah: 3, verses: ["آل عمران: 31", "المائدة: 54", "البقرة: 165"] };
    }
    if (query.includes("صلاه") || query.includes("صلاة")) {
        return { title: "الصلاة", surah: 2, verses: ["البقرة: 43", "العنكبوت: 45", "المؤمنون: 1-2"] };
    }
    if (query.includes("موت") || query.includes("اخره") || query.includes("قيامه")) {
        return { title: "الآخرة وتذكر المصير", surah: 75, verses: ["القيامة: 1-15", "الحديد: 20", "آل عمران: 185"] };
    }

    return { title: "التدبر والسكينة", surah: 94, verses: ["الشرح: 5-6", "الضحى: 3-5", "الرعد: 28"] };
}

/* =========================================================
   DARK MODE
========================================================= */
function initializeTheme() {
    const buttons = document.querySelectorAll("#themeBtn, .theme-btn, #themeToggle, #darkModeBtn, [data-theme-toggle], [data-action='theme']");

    const savedTheme = localStorage.getItem("wardakTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    buttons.forEach(button => {
        button.addEventListener("click", toggleTheme);
    });
}

/* =========================================================
   TOGGLE DARK MODE
========================================================= */
function toggleTheme() {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");

    localStorage.setItem("wardakTheme", dark ? "dark" : "light");
    showToast(dark ? "تم تفعيل الوضع الليلي 🌙" : "تم إيقاف الوضع الليلي ☀️");
}

/* =========================================================
   TOAST
========================================================= */
function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add("show");
    clearTimeout(window.wardakToastTimer);

    window.wardakToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* =========================================================
   إكمال القراءة (المصحف المصور)
========================================================= */
function resumeReading() {
    const lastPage = localStorage.getItem('wardakMushafPage');
    if (lastPage) {
        window.location.href = "mushaf.html";
    } else {
        showToast("جاري فتح المصحف المصور...");
        setTimeout(() => {
            window.location.href = "mushaf.html";
        }, 800);
    }
}

/* =========================================================
   PUBLIC API
========================================================= */
window.Wardak = {
    getData, saveData, selectPlan, completeToday, updateDashboard,
    updateCurrentPlan, updateTodayWird, updateHero, toggleTheme, searchQuranTopic, resumeReading
};
