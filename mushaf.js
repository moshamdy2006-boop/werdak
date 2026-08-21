// إعداد المتغيرات
let currentPage = 1;
const totalPages = 604;

const mushafImage = document.getElementById("mushafImage");
const pageNumDisplay = document.getElementById("pageNumDisplay");
const nextPageBtn = document.getElementById("nextPage");
const prevPageBtn = document.getElementById("prevPage");
const themeBtn = document.getElementById("mushafThemeBtn");

// دالة تحميل الصورة
function loadPage(page) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    currentPage = page;
    mushafImage.src = `https://quran.ksu.edu.sa/png_big/${currentPage}.png`;
    pageNumDisplay.textContent = currentPage;

    // حفظ الصفحة في المتصفح
    localStorage.setItem("wardakMushafPage", currentPage);
}

// ==========================================
// تم تصحيح أزرار التقليب هنا
// ==========================================
nextPageBtn.addEventListener("click", () => {
    loadPage(currentPage + 1); // الصفحة التالية تزود الرقم
});

prevPageBtn.addEventListener("click", () => {
    loadPage(currentPage - 1); // الصفحة السابقة تنقص الرقم
});

// تفعيل الوضع الليلي
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("wardakTheme", isDark ? "dark" : "light");
    applyImageDarkFilter();
});

// فلتر ذكي للصورة في الوضع الليلي (Invert + Hue Rotation)
function applyImageDarkFilter() {
    if (document.body.classList.contains("dark")) {
        mushafImage.style.filter = "invert(1) hue-rotate(180deg) brightness(1.1) contrast(1.1)";
    } else {
        mushafImage.style.filter = "none";
    }
}

// عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
    // استرجاع الوضع الليلي
    const savedTheme = localStorage.getItem("wardakTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
    applyImageDarkFilter();

    // استرجاع آخر صفحة
    const savedPage = localStorage.getItem("wardakMushafPage");
    loadPage(savedPage ? parseInt(savedPage) : 1);
});