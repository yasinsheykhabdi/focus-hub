/* ==========================================================================
   Focus Hub Pro - Unified Master Engine (script.js)
   طراحی و توسعه: یاسین شیخ‌عبدی 🐾
   نسخه نهایی، پایدار، بدون تکرار متغیر و آماده برای استقرار (Production Ready)
   ========================================================================== */

// ==========================================
// ۱. توابع کمکی و ذخیره‌سازی داده
// ==========================================
function safeGet(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeHistoryState(type, state, url) {
  try {
    if (type === 'replace') history.replaceState(state, '', url);
    else history.pushState(state, '', url);
  } catch (e) {}
}

function decimalToTimeString(dec) {
  if (isNaN(dec) || dec === null || dec === undefined) return '00:00';
  let h = Math.floor(dec);
  let m = Math.round((dec - h) * 60);
  if (m === 60) { h += 1; m = 0; }
  const hh = String(h < 10 ? '0' + h : h);
  const mm = String(m < 10 ? '0' + m : m);
  return `${hh}:${mm}`;
}

function decimalToInputTime(dec) {
  if (dec >= 24) return '23:59';
  return decimalToTimeString(dec);
}

// ==========================================
// ۲. موتور دوزبانه جامع سراسری (FA / EN)
// ==========================================
let currentLang = localStorage.getItem('focus_hub_lang') || 'fa';

const daysDict = {
  fa: [
    { key: 'sat', name: 'شنبه' },
    { key: 'sun', name: 'یکشنبه' },
    { key: 'mon', name: 'دوشنبه' },
    { key: 'tue', name: 'سه‌شنبه' },
    { key: 'wed', name: 'چهارشنبه' },
    { key: 'thu', name: 'پنج‌شنبه' },
    { key: 'fri', name: 'جمعه' }
  ],
  en: [
    { key: 'sat', name: 'Saturday' },
    { key: 'sun', name: 'Sunday' },
    { key: 'mon', name: 'Monday' },
    { key: 'tue', name: 'Tuesday' },
    { key: 'wed', name: 'Wednesday' },
    { key: 'thu', name: 'Thursday' },
    { key: 'fri', name: 'Friday' }
  ]
};

const roleMapDict = {
  fa: {
    student: 'دانش‌آموز',
    university: 'دانشجو',
    konkoor: 'کنکوری',
    freelancer: 'فریلنسر / کارمند'
  },
  en: {
    student: 'Student',
    university: 'College Student',
    konkoor: 'Exam Candidate',
    freelancer: 'Freelancer / Specialist'
  }
};

const i18nDOM = {
  fa: {
    homeBtn: '🏠 برگشت به میدان اصلی',
    h2MainTitle: '📅 مرکز فرماندهی و چیدمان برنامه',
    btnTimeline: '🎓 چیدمان برنامه 🐾',
    btnKanban: '📋 چک‌لیست روزانه',
    openAddWeekly: '+ افزودن درس دستی',
    openGuide: '🐱 راهنما',
    openEdit: '⚙️ تنظیمات',
    sectionGuide: '💡 راهنمای این بخش',
    hoursTxt: 'کل ساعات هفتگی: ',
    coursesTxt: 'تعداد برنامه‌ها: ',
    noConflict: '✨ وضعیت: چیدمان بدون تداخل و منظم',
    hasConflict: '⚠️ تداخل زمانی شناسایی شد!',
    dragHint: '💡 با ماوس یا لمس صفحه بکشید تا بازه زمانی در چیدمان برنامه ایجاد شود! 🐾',
    emptyTasks: 'امروز تسکی ثبت نشده است 🐾',
    emptyBoard: 'رد پایی نیست! 🐾',
    hoursWord: 'ساعت',
    tasksWord: 'تسک',
    remainingWord: 'تسک باقی‌مانده'
  },
  en: {
    homeBtn: '🏠 Back to Main Hub',
    h2MainTitle: '📅 Command Center & Schedule Matrix',
    btnTimeline: '🎓 Schedule Matrix 🐾',
    btnKanban: '📋 Daily Checklist',
    openAddWeekly: '+ Add Manual Class',
    openGuide: '🐱 Guide',
    openEdit: '⚙️ Settings',
    sectionGuide: '💡 Section Guide',
    hoursTxt: 'Total Weekly Hours: ',
    coursesTxt: 'Total Scheduled Tasks: ',
    noConflict: '✨ Status: Conflict-free & Organized',
    hasConflict: '⚠️ Time Conflict Detected!',
    dragHint: '💡 Drag mouse or touch to create a time slot on schedule! 🐾',
    emptyTasks: 'No tasks scheduled for today 🐾',
    emptyBoard: 'No footprints here! 🐾',
    hoursWord: 'hrs',
    tasksWord: 'tasks',
    remainingWord: 'tasks remaining'
  }
};

function getDaysList() {
  return daysDict[currentLang] || daysDict.fa;
}

function getRoleText(roleVal) {
  const map = roleMapDict[currentLang] || roleMapDict.fa;
  return map[roleVal] || roleVal;
}

function applyAppLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('focus_hub_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';

  const isFa = (lang === 'fa');
  const t = i18nDOM[lang];

  const setT = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  // ۱. دکمه‌های سوئیچ زبان در تنظیمات
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-set-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // ۲. هدر و میدان اصلی
  document.querySelectorAll('.back-to-hub-btn').forEach(btn => {
    btn.textContent = t.homeBtn;
  });
  setT('open-guide-btn', t.openGuide);
  setT('open-edit-btn', t.openEdit);

  const hubCardsEl = document.querySelectorAll('.hub-card');
  if (hubCardsEl.length >= 4) {
    hubCardsEl[0].querySelector('h3').textContent = isFa ? 'میز تمرکز امروز' : 'Today Focus Desk';
    hubCardsEl[0].querySelector('p').textContent = isFa ? 'تایمر پومودورو، لیست تکالیف جاری و اهداف پین‌شده' : 'Pomodoro timer, daily checklist, and pinned goals';

    hubCardsEl[1].querySelector('h3').textContent = isFa ? 'مرکز فرماندهی' : 'Command Center';
    hubCardsEl[1].querySelector('p').textContent = isFa ? 'تقویم ماتریسی هفتگی 06:00 تا 24:00 با کشیدن ماوس و لمس' : 'Weekly 06:00 to 24:00 matrix with mouse & touch drag';

    hubCardsEl[2].querySelector('h3').textContent = isFa ? 'رکوردها و گزارش تحلیلی' : 'Analytics & Records';
    hubCardsEl[2].querySelector('p').textContent = isFa ? 'نمودار توزیع ساعات، تحلیل هفتگی و سنجش عملکرد' : 'Hour distribution chart, weekly AI review & metrics';

    hubCardsEl[3].querySelector('h3').textContent = isFa ? 'کتابخانه منابع' : 'Resource Library';
    hubCardsEl[3].querySelector('p').textContent = isFa ? 'قفسه‌بندی لینک‌ها، جزوات، دوره‌ها و ابزارهای پرکاربرد' : 'Organized shelves for notes, links, and study tools';
  }

  // ۳. خانه ۱: میز تمرکز امروز
  const focusH2 = document.querySelector('#house-focus .house-header h2');
  if (focusH2) focusH2.textContent = isFa ? '🎯 میز تمرکز امروز' : '🎯 Today Focus Desk';
  setT('open-focus-guide-btn', t.sectionGuide);

  const timerCardH2 = document.querySelector('.timer-card .widget-header h2');
  if (timerCardH2) timerCardH2.textContent = isFa ? '⏱ تایمر تمرکز' : '⏱ Focus Timer';
  setT('cat-status-badge', isFa ? 'حالت: آماده مطالعه 🐾' : 'Status: Ready to Study 🐾');
  setT('freeflow-mode-btn', isFa ? 'حالت آزاد ⏱️' : 'Freeflow Mode ⏱️');
  setT('active-focus-task-text', isFa ? '🎯 هدف فعلی' : '🎯 Pinned Goal');

  setT('timer-start-btn', isFa ? 'شروع تمرکز' : 'Start Focus');
  setT('timer-pause-btn', isFa ? 'مکث' : 'Pause');
  setT('timer-reset-btn', isFa ? 'ریست' : 'Reset');

  const studySel = document.getElementById('study-time-select');
  if (studySel && studySel.options.length >= 4) {
    studySel.options[0].text = isFa ? '25 دقیقه (استاندارد)' : '25 mins (Standard)';
    studySel.options[1].text = isFa ? '45 دقیقه (عمیق)' : '45 mins (Deep)';
    studySel.options[2].text = isFa ? '60 دقیقه (سنگین)' : '60 mins (Intense)';
    studySel.options[3].text = isFa ? '90 دقیقه (کنکوری)' : '90 mins (Marathon)';
  }

  const breakSel = document.getElementById('break-time-select');
  if (breakSel && breakSel.options.length >= 3) {
    breakSel.options[0].text = isFa ? '5 دقیقه (کوتاه)' : '5 mins (Short)';
    breakSel.options[1].text = isFa ? '10 دقیقه (متوسط)' : '10 mins (Medium)';
    breakSel.options[2].text = isFa ? '15 دقیقه (بلند)' : '15 mins (Long)';
  }

  const tasksCardH2 = document.querySelector('.tasks-card .widget-header h2');
  if (tasksCardH2) tasksCardH2.textContent = isFa ? '📝 تکالیف و کارهای امروز (همگام با تقویم)' : '📝 Today Tasks & Agenda (Synced)';
  
  const taskInputEl = document.getElementById('task-input');
  if (taskInputEl) taskInputEl.placeholder = isFa ? 'عنوان تکلیف، درس یا هدف امروز...' : 'Task, study block or goal title...';

  const taskStatusSel = document.getElementById('task-status-input');
  if (taskStatusSel && taskStatusSel.options.length >= 4) {
    taskStatusSel.options[0].text = isFa ? '⚪ جاری (سفید)' : '⚪ In Progress (White)';
    taskStatusSel.options[1].text = isFa ? '🟢 انجام شد (سبز)' : '🟢 Completed (Green)';
    taskStatusSel.options[2].text = isFa ? '🔴 عقب‌افتاده (قرمز)' : '🔴 Overdue (Red)';
    taskStatusSel.options[3].text = isFa ? '🔵 آینده (آبی)' : '🔵 Upcoming (Blue)';
  }

  document.querySelectorAll('.time-chip-label').forEach((lbl, idx) => {
    if (idx === 0) lbl.textContent = isFa ? 'شروع:' : 'Start:';
    if (idx === 1) lbl.textContent = isFa ? 'پایان:' : 'End:';
  });

  const submitTaskBtn = document.querySelector('.submit-task-neon-btn span:first-child');
  if (submitTaskBtn) submitTaskBtn.textContent = isFa ? '+ ثبت در میز تمرکز' : '+ Add to Focus Desk';

  // ۴. خانه ۲: مرکز فرماندهی و چیدمان برنامه
  setT('h2-main-title', t.h2MainTitle);
  setT('view-mode-timeline-btn', t.btnTimeline);
  setT('view-mode-tasks-btn', t.btnKanban);
  setT('open-ai-suggest-btn', isFa ? '🤖 برنامه پیشنهادی AI ✨' : '🤖 AI Smart Planner ✨');
  setT('export-schedule-btn', isFa ? '📸 خروجی تصویر و PDF' : '📸 Export PDF / Image');
  setT('open-add-weekly-btn', t.openAddWeekly);
  setT('open-planner-guide-btn', t.sectionGuide);

  setT('lbl-weekly-hours-txt', t.hoursTxt);
  setT('lbl-weekly-courses-txt', t.coursesTxt);
  setT('drag-hint-chip', t.dragHint);

  // ۵. خانه ۳: رکوردها و داشبورد تحلیلی
  const analyticsH2 = document.querySelector('#house-analytics .house-header h2');
  if (analyticsH2) analyticsH2.textContent = isFa ? '📊 رکوردها، داشبورد تحلیلی و اهداف' : '📊 Analytics Dashboard & Goals';

  const recordTitles = document.querySelectorAll('.record-box .record-title');
  if (recordTitles.length >= 4) {
    recordTitles[0].textContent = isFa ? 'پومودوروهای تکمیل‌شده' : 'Completed Pomodoros';
    recordTitles[1].textContent = isFa ? 'کل دقایق تمرکز عمیق' : 'Deep Focus Minutes';
    recordTitles[2].textContent = isFa ? 'تکالیف انجام‌شده' : 'Completed Tasks';
    recordTitles[3].textContent = isFa ? 'زنجیره روزهای مطالعه' : 'Daily Streak';
  }

  const chartH2 = document.querySelector('#house-analytics .analytics-deep-grid article:first-child .widget-header h2');
  if (chartH2) chartH2.textContent = isFa ? '📈 نمودار توزیع بار مطالعاتی در هفته' : '📈 Weekly Load Distribution';
  setT('analytics-chart-sub', isFa ? 'تفکیک ساعات ۷ روز' : '7-Day Load Breakdown');

  const meterH2 = document.querySelector('#house-analytics .analytics-deep-grid article:nth-child(2) .widget-header h2');
  if (meterH2) meterH2.textContent = isFa ? '⚖️ شاخص تعادل سطوح اولویت' : '⚖️ Priority Balance Index';

  setT('lbl-tier-high', isFa ? '🔥 سطح ۱ (حیاتی):' : '🔥 Tier 1 (Critical):');
  setT('lbl-tier-medium', isFa ? '⚡ سطح ۲ (عادی):' : '⚡ Tier 2 (Routine):');
  setT('lbl-tier-low', isFa ? '🌱 سطح ۳ (مرور):' : '🌱 Tier 3 (Review):');
  setT('lbl-completion-rate', isFa ? '🎯 نرخ وفاداری به تکالیف:' : '🎯 Task Completion Rate:');

  setT('mascot-review-title', isFa ? 'ارزیاب هوشمند عملکرد و پیشنهادات مسکات' : 'Catmodoro Smart Performance Review');
  setT('mascot-review-desc', isFa ? 'توصیه‌های تحلیلی اختصاصی برای تعادل انرژی و پیشرفت مطالعاتی' : 'Custom feedback to prevent burnout and boost efficiency');
  setT('run-weekly-analysis-btn', isFa ? '⚡ به‌روزرسانی تحلیل هوشمند' : '⚡ Refresh AI Analysis');

  // ۶. خانه ۴: کتابخانه منابع
  const libH2 = document.querySelector('#house-library .house-header h2');
  if (libH2) libH2.textContent = isFa ? '📚 کتابخانه و منابع شخصی' : '📚 Resource & Study Library';
  setT('open-library-guide-btn', t.sectionGuide);
  setT('open-add-library-btn', isFa ? '+ افزودن منبع جدید' : '+ Add New Resource');

  const libTierTitles = document.querySelectorAll('.library-tier .tier-title');
  if (libTierTitles.length >= 4) {
    libTierTitles[0].textContent = isFa ? '📝 جزوه‌ها و PDFها' : '📝 Notes & Documents';
    libTierTitles[1].textContent = isFa ? '🎥 منابع و کورس‌ها' : '🎥 Courses & Videos';
    libTierTitles[2].textContent = isFa ? '🌐 سایت‌ها و ابزارها' : '🌐 Websites & Tools';
    libTierTitles[3].textContent = isFa ? '✨ لیست پیشنهادات (14 پلتفرم مرجع)' : '✨ Suggested Resources (14 Platforms)';
  }

  // ۷. فوتر سازنده
  const devLabel = document.querySelector('.dev-label');
  if (devLabel) devLabel.textContent = isFa ? 'طراحی و توسعه توسط' : 'Designed & Developed by';
  const devTagline = document.querySelector('.dev-tagline');
  if (devTagline) devTagline.textContent = isFa ? 'خلق ابزارهای تمرکز و بهره‌وری نسل جدید برای دانش‌آموزان و دانشجویان' : 'Next-generation focus & productivity tools for students';
  const devGhBtn = document.querySelector('.github-btn span:first-of-type');
  if (devGhBtn) devGhBtn.textContent = isFa ? 'گیت‌هاب من' : 'My GitHub';
  const devSiteBtn = document.querySelector('.site-btn span');
  if (devSiteBtn) devSiteBtn.textContent = isFa ? '🌐 وب‌سایت' : '🌐 Website';

  // ۸. راهنماهای چهارگانه مسکات
  const gSpeechH3 = document.querySelector('#guide-modal .mascot-speech-bubble h3');
  const gSpeechP = document.querySelector('#guide-modal .mascot-speech-bubble p');
  if (gSpeechH3) gSpeechH3.textContent = isFa ? 'میو! سلام رفیق، من Catmodoro ، راهنمای Focus Hub هستم 🐾' : "Meow! Hey buddy, I'm Catmodoro, your Focus Hub guide 🐾";
  if (gSpeechP) gSpeechP.textContent = isFa ? 'اینجا میز کار متمرکز توئه! بیا کمکت کنم بهترین استفاده رو ازش ببری:' : "This is your focused study hub! Let me show you around:";

  const gCards = document.querySelectorAll('#guide-modal .guide-step-card');
  if (gCards.length >= 4) {
    gCards[0].querySelector('h4').textContent = isFa ? '🎯 میز تمرکز' : '🎯 Focus Desk';
    gCards[0].querySelector('p').textContent = isFa ? 'تایمر پومودورو رو استارت بزن، تسک‌های روزت رو تیک بزن یا هدف مهم رو پین کن روی تایمر!' : 'Start the Pomodoro timer, tick off daily tasks, or pin your main goal right above the timer!';

    gCards[1].querySelector('h4').textContent = isFa ? '📅 مرکز فرماندهی' : '📅 Command Center';
    gCards[1].querySelector('p').textContent = isFa ? 'با ماوس یا لمس روی جدول درگ کن و برنامه‌ت رو بچین؛ وضعیت رنگی و تداخل‌ها رو زنده ببین!' : 'Drag with mouse or touch on the matrix to schedule classes; track live colors & conflicts!';

    gCards[2].querySelector('h4').textContent = isFa ? '📊 رکوردها و گزارش تحلیلی' : '📊 Analytics & Records';
    gCards[2].querySelector('p').textContent = isFa ? 'نمودار توزیع ساعات، شاخص تعادل ۳ سطحی و ارزیاب هوشمند عملکرد هفتگی.' : 'Hour distribution chart, 3-tier balance score, and AI weekly performance evaluation.';

    gCards[3].querySelector('h4').textContent = isFa ? '📚 کتابخانه منابع' : '📚 Resource Library';
    gCards[3].querySelector('p').textContent = isFa ? 'لینک دوره‌ها، فایل‌ها و ابزارهای پرکاربردت رو قفسه‌بندی کن تا همیشه دَمِ دست باشن.' : 'Organize course links, drive cheatsheets, and platforms into clean, categorized shelves.';
  }
  setT('close-guide-btn', isFa ? 'فهمیدم، بریم سر کار! 🚀' : "Got it, let's work! 🚀");

  const fdSpeechH3 = document.querySelector('#focus-desk-guide-modal .mascot-speech-bubble h3');
  const fdSpeechP = document.querySelector('#focus-desk-guide-modal .mascot-speech-bubble p');
  if (fdSpeechH3) fdSpeechH3.textContent = isFa ? 'راهنمای کار با میز تمرکز و تکالیف امروز 🐾' : "Guide: Today's Focus Desk & Daily Agenda 🐾";
  if (fdSpeechP) fdSpeechP.textContent = isFa ? 'این بخش طراحی شده تا بدون حواس‌پرتی روی تکالیف جاری کار کنی:' : "Designed to keep you in deep focus without distractions:";

  const fdCards = document.querySelectorAll('#focus-desk-guide-modal .guide-step-card');
  if (fdCards.length >= 4) {
    fdCards[0].querySelector('h4').textContent = isFa ? '🔄 همگام‌سازی کامل با تقویم' : '🔄 Timetable Auto-Sync';
    fdCards[0].querySelector('p').textContent = isFa ? 'هر درسی که در مرکز فرماندهی برای امروز چیده باشی، خودکار اینجا قرار می‌گیرد.' : 'Every class or task you schedule for today in Command Center automatically appears here.';

    fdCards[1].querySelector('h4').textContent = isFa ? '🛡️ حفاظت از برنامه (بدون حذف تصادفی)' : '🛡️ Schedule Protection';
    fdCards[1].querySelector('p').textContent = isFa ? 'در این بخش امکان حذف وجود ندارد تا تمرکزت به هم نریزد؛ فقط می‌توانی تسک اضافه کنی و وضعیتش را مشخص کنی.' : 'Accidental deletion is locked here to safeguard focus; add tasks or update progress seamlessly.';

    fdCards[2].querySelector('h4').textContent = isFa ? '🎨 چرخه 4 رنگ دستی + زرد خودکار' : '🎨 4 Colors + Auto-Yellow';
    fdCards[2].querySelector('p').textContent = isFa ? 'سفید (جاری)، سبز (انجام شد)، قرمز (جامانده)، آبی (آینده) و زرد هوشمند خودکار برای کارهای سپری‌شده.' : 'White (active), Green (done), Red (missed), Blue (future), plus smart Yellow for past-due slots.';

    fdCards[3].querySelector('h4').textContent = isFa ? '📌 پین مستقیم روی تایمر' : '📌 Pin to Pomodoro';
    fdCards[3].querySelector('p').textContent = isFa ? 'با زدن دکمه 📌 هدف اصلی‌ات را بالای ثانیه‌شمار پومودورو پین کن تا متمرکز بمانی.' : 'Click 📌 to lock your primary task right above the countdown timer for zero drift.';
  }
  setT('close-focus-guide-btn', isFa ? 'متوجه شدم 🚀' : 'Understood 🚀');

  setT('pg-modal-title', isFa ? 'راهنمای کار با مرکز فرماندهی و چیدمان برنامه 🐾' : 'Guide: Command Center & Matrix Timetable 🐾');
  setT('pg-modal-desc', isFa ? 'این بخش اتاق فرماندهی هفتگی شماست؛ همه‌چیز سریع، دقیق و متمرکز:' : 'Your weekly control room: rapid, precise, and visual scheduling:');

  const pgCards = document.querySelectorAll('#planner-guide-modal .guide-step-card');
  if (pgCards.length >= 4) {
    pgCards[0].querySelector('h4').textContent = isFa ? '🎓 چیدمان برنامه' : '🎓 Matrix Timetable';
    pgCards[0].querySelector('p').textContent = isFa ? 'با ماوس یا لمس صفحه روی ساعات 06:00 تا 24:00 بکشید تا بازه زمانی ایجاد شود؛ سیستم خودکار تداخل‌ها را هشدار می‌دهد.' : 'Drag mouse or touch across 06:00-24:00 to create slots; conflicts are automatically flagged.';

    pgCards[1].querySelector('h4').textContent = isFa ? '🤖 برنامه پیشنهادی AI' : '🤖 AI Smart Planner';
    pgCards[1].querySelector('p').textContent = isFa ? 'با زدن دکمه ربات، کارت هوشمند بالا می‌آید و برنامه را در ۳ سطح اولویت سطر به سطر آماده اضافه کردن می‌کند.' : 'Open the AI card to craft and insert courses line-by-line across 3 priority tiers.';

    pgCards[2].querySelector('h4').textContent = isFa ? '📋 چک‌لیست روزانه' : '📋 Daily Checklist';
    pgCards[2].querySelector('p').textContent = isFa ? 'دید ستونی روزهای هفته؛ تکالیف و کلاس‌های هر روز را به شکل کارت‌های دسته‌بندی‌شده و مرتب مدیریت کنید.' : 'Kanban column view of weekly days to organize tasks in clean, structured cards.';

    pgCards[3].querySelector('h4').textContent = isFa ? '🟡 وضعیت زرد هوشمند خودکار' : '🟡 Smart Auto-Yellow';
    pgCards[3].querySelector('p').textContent = isFa ? 'اگر ساعت کلاسی به اتمام برسد و سبز نشده باشد، سیستم خودکار کارت را به رنگ زرد (سپری‌شده) درمی‌آورد.' : 'If a class time ends without being marked completed, it automatically turns to warning yellow.';
  }
  setT('close-planner-guide-btn', isFa ? 'فهمیدم، بزن بریم 🚀' : "Got it, let's go 🚀");

  const libSpeechH3 = document.querySelector('#library-guide-modal .mascot-speech-bubble h3');
  const libSpeechP = document.querySelector('#library-guide-modal .mascot-speech-bubble p');
  if (libSpeechH3) libSpeechH3.textContent = isFa ? 'راهنمای کار با کتابخانه و منابع شخصی 🐾' : 'Guide: Personal Resource Library 🐾';
  if (libSpeechP) libSpeechP.textContent = isFa ? 'اینجا قفسه اختصاصی ابزارها، لینک‌ها و فایل‌های مهم تحصیلی و کاری شماست:' : 'Your curated shelves for cheat sheets, Drive links, and university resources:';

  const libCards = document.querySelectorAll('#library-guide-modal .guide-step-card');
  if (libCards.length >= 4) {
    libCards[0].querySelector('h4').textContent = isFa ? '📂 قفسه‌بندی 4 گانه تخصصی' : '📂 4 Dedicated Shelves';
    libCards[0].querySelector('p').textContent = isFa ? 'جزوه‌ها، دوره‌ها، سایت‌ها و 14 پلتفرم علمی و دانشگاهی مرجع برای دسترسی فوری.' : 'PDFs, video courses, useful tools, and 14 premier scientific platforms for instant reference.';

    libCards[1].querySelector('h4').textContent = isFa ? '➕ افزودن لینک و درایو شخصی' : '➕ Cloud & Drive Bookmarks';
    libCards[1].querySelector('p').textContent = isFa ? 'لینک جزوات، گوگل درایو و ویدیوهای آموزشی‌ات را با یک کلیک در قفسه مربوطه ذخیره کن.' : 'Save course URLs, Google Drive notes, and tutorial videos to your shelf in seconds.';

    libCards[2].querySelector('h4').textContent = isFa ? '🔗 دسترسی امن در تب جدید' : '🔗 Safe New-Tab Access';
    libCards[2].querySelector('p').textContent = isFa ? 'تمام لینک‌ها با کلیک در تب جدید باز می‌شوند تا تمرکزت روی صفحه برنامه حفظ شود.' : 'Links open safely in separate tabs so your current focus timer is never disturbed.';

    libCards[3].querySelector('h4').textContent = isFa ? '🗑️ مدیریت و حذف آسان' : '🗑️ Simple Shelf Cleanup';
    libCards[3].querySelector('p').textContent = isFa ? 'با دکمه ✕ کنار هر منبع شخصی، در هر زمان می‌توانی قفسه‌ات را ویرایش و مرتب کنی.' : 'Delete or re-organize custom links anytime using the quick ✕ button.';
  }
  setT('close-library-guide-btn', isFa ? 'فهمیدم، بزن بریم 🚀' : "Got it, let's go 🚀");

  // ۹. برنامه‌ساز AI و ورودی‌ها
  const aiHeaderH3 = document.querySelector('#ai-suggest-modal h3');
  const aiHeaderP = document.querySelector('#ai-suggest-modal p');
  if (aiHeaderH3) aiHeaderH3.textContent = isFa ? 'برنامه‌ساز هوشمند تحصیلی (AI Planner) 🐾' : 'AI Smart Academic Planner 🐾';
  if (aiHeaderP) aiHeaderP.textContent = isFa ? 'ثبت سطر به سطر با تفکیک ۳ سطح اولویت و پیش‌نمایش ماتریسی قبل از اعمال نهایی.' : 'Line-by-line entry categorized by 3 priority tiers with live preview before applying.';

  const aiFormTitle = document.querySelector('#ai-quick-add-row-form span');
  if (aiFormTitle) aiFormTitle.textContent = isFa ? '➕ افزودن درس جدید به پکیج پیشنهادی:' : '➕ Add new course to proposed plan:';

  const aiInputLabels = document.querySelectorAll('#ai-quick-add-row-form .input-field-group label');
  if (aiInputLabels.length >= 4) {
    aiInputLabels[0].textContent = isFa ? 'نام درس یا مبحث:' : 'Course or Topic:';
    aiInputLabels[1].textContent = isFa ? 'سطح اولویت:' : 'Priority Tier:';
    aiInputLabels[2].textContent = isFa ? 'روز هفته:' : 'Day of Week:';
    aiInputLabels[3].textContent = isFa ? 'مدت زمان:' : 'Duration:';
  }

  const aiTitleInput = document.getElementById('ai-input-title');
  if (aiTitleInput) aiTitleInput.placeholder = isFa ? 'مثال: ریاضی مهندسی...' : 'e.g. Linear Algebra...';

  const aiTierSel = document.getElementById('ai-input-tier');
  if (aiTierSel && aiTierSel.options.length >= 3) {
    aiTierSel.options[0].text = isFa ? '🔥 سطح ۱: حیاتی (عمیق)' : '🔥 Tier 1: Critical (Deep)';
    aiTierSel.options[1].text = isFa ? '⚡ سطح ۲: عادی (روتین)' : '⚡ Tier 2: Routine (Standard)';
    aiTierSel.options[2].text = isFa ? '🌱 سطح ۳: مرور (سبک)' : '🌱 Tier 3: Review (Light)';
  }

  const aiDaySel = document.getElementById('ai-input-day');
  if (aiDaySel && aiDaySel.options.length >= 7) {
    const daysArr = getDaysList();
    daysArr.forEach((d, i) => {
      if (aiDaySel.options[i]) aiDaySel.options[i].text = d.name;
    });
  }

  const aiDurSel = document.getElementById('ai-input-duration');
  if (aiDurSel && aiDurSel.options.length >= 4) {
    aiDurSel.options[0].text = isFa ? '🎓 ۱.۵ ساعته' : '🎓 1.5 Hours';
    aiDurSel.options[1].text = isFa ? '⏱️ ۱ ساعته' : '⏱️ 1 Hour';
    aiDurSel.options[2].text = isFa ? '📚 ۲ ساعته' : '📚 2 Hours';
    aiDurSel.options[3].text = isFa ? '⚡ ۴۵ دقیقه' : '⚡ 45 Mins';
  }

  const aiAddRowBtn = document.querySelector('#ai-quick-add-row-form button[type="submit"]');
  if (aiAddRowBtn) aiAddRowBtn.textContent = isFa ? '+ افزودن سطر' : '+ Add Row';

  const aiPreviewHeaderSpan = document.querySelector('#ai-draft-preview-box span:first-child');
  if (aiPreviewHeaderSpan) aiPreviewHeaderSpan.textContent = isFa ? '👁️ پیش‌نمایش چیدمان هوشمند در خط زمانی ۰۶:۰۰ تا ۲۴:۰۰:' : '👁️ Schedule Preview (06:00 - 24:00):';

  setT('ai-add-all-suggested-btn', isFa ? '🚀 تأیید و ثبت در جدول اصلی چیدمان' : '🚀 Confirm & Apply to Timetable');
  setT('ai-close-suggest-footer-btn', isFa ? 'بستن پنجره' : 'Close Window');

  // ۱۰. مودال افزودن کلاس و کتابخانه
  const addModalTitle = document.querySelector('#add-weekly-modal h2');
  if (addModalTitle) addModalTitle.textContent = isFa ? '📅 افزودن به جدول هفتگی 🐾' : '📅 Add Class to Timetable 🐾';
  
  const addModalLabels = document.querySelectorAll('#weekly-task-form .input-field-group label');
  if (addModalLabels.length >= 4) {
    addModalLabels[0].textContent = isFa ? 'عنوان تکلیف یا درس:' : 'Class or Task Title:';
    addModalLabels[1].textContent = isFa ? 'روز هفته:' : 'Day of Week:';
    addModalLabels[2].textContent = isFa ? 'وضعیت و رنگ کارت:' : 'Card Status & Color:';
    addModalLabels[3].textContent = isFa ? '📝 یادداشت و نکات مهم (اختیاری):' : '📝 Notes & Reminders (Optional):';
  }

  const weeklyTitleInput = document.getElementById('weekly-task-title');
  if (weeklyTitleInput) weeklyTitleInput.placeholder = isFa ? 'مثال: مطالعه ریاضی مهندسی، تست فیزیک' : 'e.g. Software Engineering, Physics Exam';

  const weeklyDaySel = document.getElementById('weekly-day-select');
  if (weeklyDaySel && weeklyDaySel.options.length >= 7) {
    const daysArr = getDaysList();
    daysArr.forEach((d, i) => {
      if (weeklyDaySel.options[i]) weeklyDaySel.options[i].text = d.name;
    });
  }

  const weeklyStatusSel = document.getElementById('weekly-status-select');
  if (weeklyStatusSel && weeklyStatusSel.options.length >= 4) {
    weeklyStatusSel.options[0].text = isFa ? '⚪ در حال انجام (سفید)' : '⚪ In Progress (White)';
    weeklyStatusSel.options[1].text = isFa ? '🟢 انجام‌شده و موفق (سبز)' : '🟢 Completed (Green)';
    weeklyStatusSel.options[2].text = isFa ? '🔴 جامانده یا عقب‌افتاده (قرمز)' : '🔴 Overdue (Red)';
    weeklyStatusSel.options[3].text = isFa ? '🔵 برنامه‌های آینده (آبی)' : '🔵 Upcoming (Blue)';
  }

  const weeklyNotesArea = document.getElementById('weekly-task-notes');
  if (weeklyNotesArea) weeklyNotesArea.placeholder = isFa ? 'مثال: مباحث فصل سوم، حل تمرین‌های صفحه ۴۲ یا لینک فایل جزوه...' : 'e.g. Chapter 3 recap, practice problem set, drive cheat-sheet link...';

  const pickerLabel = document.querySelector('.picker-label');
  if (pickerLabel) pickerLabel.textContent = isFa ? '⏱️ تنظیم بازه زمانی کلاس / مطالعه:' : '⏱️ Set Class / Study Time Slot:';

  const blockTitles = document.querySelectorAll('.block-title');
  if (blockTitles.length >= 2) {
    blockTitles[0].textContent = isFa ? '🚀 شروع کلاس:' : '🚀 Start Time:';
    blockTitles[1].textContent = isFa ? '🏁 پایان کلاس:' : '🏁 End Time:';
  }

  const presetsHint = document.querySelector('.presets-hint');
  if (presetsHint) presetsHint.textContent = isFa ? '⚡ پارت‌های متداول:' : '⚡ Quick Presets:';

  const presetPills = document.querySelectorAll('.presets-grid-wrapper .preset-pill-btn');
  if (presetPills.length >= 4) {
    presetPills[0].textContent = isFa ? '🎓 1.5 ساعته (دانشگاه)' : '🎓 1.5 hrs (Lecture)';
    presetPills[1].textContent = isFa ? '⏱️ 1 ساعت' : '⏱️ 1 Hour';
    presetPills[2].textContent = isFa ? '📚 2 ساعت' : '📚 2 Hours';
    presetPills[3].textContent = isFa ? '⚡ 45 دقیقه' : '⚡ 45 Mins';
  }

  const addModalSubmit = document.querySelector('#weekly-task-form button[type="submit"]');
  if (addModalSubmit) addModalSubmit.textContent = isFa ? 'ثبت در جدول 📌' : 'Save to Schedule 📌';

  const addLibH2 = document.querySelector('#add-library-modal h2');
  if (addLibH2) addLibH2.textContent = isFa ? '📚 افزودن منبع جدید' : '📚 Add New Study Resource';

  const libLabels = document.querySelectorAll('#library-item-form .input-field-group label');
  if (libLabels.length >= 3) {
    libLabels[0].textContent = isFa ? 'طبقه / دسته‌بندی:' : 'Category / Shelf:';
    libLabels[1].textContent = isFa ? 'نام منبع:' : 'Resource Name:';
    libLabels[2].textContent = isFa ? 'لینک (URL) یا آدرس درایو:' : 'Link (URL) or Cloud Drive:';
  }

  const libCatSel = document.getElementById('lib-category-select');
  if (libCatSel && libCatSel.options.length >= 3) {
    libCatSel.options[0].text = isFa ? '📝 جزوه‌ها و PDFها' : '📝 Notes & PDFs';
    libCatSel.options[1].text = isFa ? '🎥 منابع و کورس‌ها' : '🎥 Courses & Videos';
    libCatSel.options[2].text = isFa ? '🌐 سایت‌ها و ابزارها' : '🌐 Websites & Tools';
  }

  const libSubmitBtn = document.querySelector('#library-item-form button[type="submit"]');
  if (libSubmitBtn) libSubmitBtn.textContent = isFa ? 'ذخیره در قفسه 📖' : 'Save to Shelf 📖';

  // ترجمه عناوین و گزینه‌های مودال جزئیات وظیفه
  setT('lbl-detail-time-tag', isFa ? '⏱️ بازه زمانی:' : '⏱️ Time Slot:');
  setT('lbl-detail-status-tag', isFa ? '🎨 وضعیت رنگی وظیفه:' : '🎨 Task Color & Status:');
  setT('lbl-detail-notes-tag', isFa ? '📝 یادداشت این برنامه:' : '📝 Notes & Reminders:');

  const detailNotesEl = document.getElementById('modal-detail-notes');
  if (detailNotesEl) {
    detailNotesEl.placeholder = isFa ? 'یادداشتی برای این برنامه ثبت نشده است...' : 'No notes registered for this task...';
  }

  const detailStatusSel = document.getElementById('modal-detail-status-select');
  if (detailStatusSel && detailStatusSel.options.length >= 4) {
    detailStatusSel.options[0].text = isFa ? '⚪ در حال انجام (سفید)' : '⚪ In Progress (White)';
    detailStatusSel.options[1].text = isFa ? '🟢 انجام‌شده و موفق (سبز)' : '🟢 Completed (Green)';
    detailStatusSel.options[2].text = isFa ? '🔴 عقب‌افتاده / جامانده (قرمز)' : '🔴 Overdue (Red)';
    detailStatusSel.options[3].text = isFa ? '🔵 برنامه‌های آینده (آبی)' : '🔵 Upcoming (Blue)';
  }

  const detailSaveBtn = document.getElementById('modal-save-detail-btn');
  if (detailSaveBtn) detailSaveBtn.textContent = isFa ? 'ذخیره تغییرات 💾' : 'Save Changes 💾';
  const detailDelBtn = document.getElementById('modal-delete-task-btn');
  if (detailDelBtn) detailDelBtn.textContent = isFa ? 'حذف 🗑️' : 'Delete 🗑️';

  updateHeader();
  renderDailyTasks();
  if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
  else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
  renderLibrary();
  renderAnalyticsDashboard();
  initMultiPlanSelector();
  updateTimePickerOptions();
  renderAiSuggestedPlan();
}

// ==========================================
// ۳. وضعیت‌ها و داده‌های چندبرنامه‌ای (Multi-Plan)
// ==========================================
const TC_MIN_HOUR = 6;
const TC_MAX_HOUR = 24;
const TC_TOTAL_HOURS = TC_MAX_HOUR - TC_MIN_HOUR;

let userProfile = safeGet('focus_hub_user_v2', null);
let appStats = safeGet('focus_hub_stats_v2', {
  pomodoros: 0, minutes: 0, tasks: 0, streak: 1, lastLogin: new Date().toDateString()
});
if (typeof appStats.streak !== 'number' || isNaN(appStats.streak)) appStats.streak = 1;

let dailyTasks = safeGet('focus_hub_daily_tasks', []);

let multiPlanState = safeGet('focus_hub_multi_plans_v1', {
  activePlanId: 'main',
  plans: {
    main: {
      name: 'برنامه اصلی',
      tasks: {
        sat: [{ id: 1, text: 'مطالعه ریاضی مهندسی', start: 8.0, end: 10.0, status: 'status-green', notes: 'حل تمرین‌های انتهای فصل ۲' }],
        sun: [{ id: 2, text: 'پروژه پایانی وب', start: 10.5, end: 12.5, status: 'status-white', notes: 'تکمیل کدهای جاوااسکریپت داشبورد' }],
        mon: [{ id: 3, text: 'تست‌های فیزیک', start: 14.0, end: 16.0, status: 'status-blue', notes: 'تست‌های سراسری مبحث الکتریسیته' }],
        tue: [], wed: [], thu: [], fri: []
      }
    },
    exam: {
      name: 'سناریو فشرده شب امتحان',
      tasks: {
        sat: [{ id: 11, text: 'مرور فشرده ریاضی', start: 9.0, end: 12.0, status: 'status-white', notes: 'حل نمونه سوالات ۳ دوره اخیر' }],
        sun: [{ id: 12, text: 'فرمول‌های فیزیک', start: 15.0, end: 18.0, status: 'status-white', notes: 'مرور فلش‌کارت‌ها' }],
        mon: [], tue: [], wed: [], thu: [], fri: []
      }
    },
    weekend: {
      name: 'سناریو مطالعاتی آخر هفته',
      tasks: {
        sat: [], sun: [], mon: [], tue: [],
        wed: [],
        thu: [{ id: 21, text: 'کارگاه برنامه‌نویسی', start: 10.0, end: 13.0, status: 'status-white', notes: 'پروژه اوپن‌سورس' }],
        fri: [{ id: 22, text: 'مطالعه آزاد و زبان', start: 16.0, end: 18.0, status: 'status-white', notes: 'پادکست و لیسنینگ' }]
      }
    }
  }
});

function getActivePlanTasks() {
  const p = multiPlanState.plans[multiPlanState.activePlanId];
  return p ? p.tasks : multiPlanState.plans.main.tasks;
}

function saveActivePlanTasks(tasks) {
  if (multiPlanState.plans[multiPlanState.activePlanId]) {
    multiPlanState.plans[multiPlanState.activePlanId].tasks = tasks;
    try { localStorage.setItem('focus_hub_multi_plans_v1', JSON.stringify(multiPlanState)); } catch (e) {}
  }
}

let aiProposedPlan = safeGet('focus_hub_ai_proposed_v2', [
  { id: 201, title: 'حل مسائل ریاضی مهندسی', day: 'sat', start: 9.0, end: 10.5, tier: 'high', priorityLabel: 'صبح (فوری)', added: false },
  { id: 202, title: 'کدنویسی فرانت‌اند پروژه وب', day: 'sat', start: 11.0, end: 12.5, tier: 'high', priorityLabel: 'عصر (اوج)', added: false },
  { id: 203, title: 'تست‌های فیزیک الکتریسیته', day: 'mon', start: 16.0, end: 17.5, tier: 'medium', priorityLabel: 'عصر (اوج)', added: false },
  { id: 204, title: 'مرور واژگان و ریدینگ زبان', day: 'wed', start: 19.0, end: 20.0, tier: 'low', priorityLabel: 'شب (آرام)', added: false }
]);

let activeFocusTaskId = null;
let currentWeeklyMode = 'timeline';
let currentInspectingTaskId = null;
let currentInspectingDay = null;

// ==========================================
// ۴. خودکارسازی وضعیت‌های زرد و سفید
// ==========================================
function autoUpdateTaskStatuses() {
  const now = new Date();
  const currentDec = now.getHours() + (now.getMinutes() / 60);
  const todayKey = getTodayCalKey();
  const dayIndexMap = { sat: 0, sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6 };
  const todayIdx = dayIndexMap[todayKey] !== undefined ? dayIndexMap[todayKey] : 0;
  const days = getDaysList();
  const activeTasks = getActivePlanTasks();

  days.forEach(day => {
    const list = activeTasks[day.key] || [];
    const dayIdx = dayIndexMap[day.key];

    list.forEach(t => {
      if (t.status !== 'status-green' && t.status !== 'status-red') {
        const s = t.start || t.hour;
        const e = t.end || (s ? s + 1.5 : null);
        if (dayIdx < todayIdx) {
          t.status = 'status-yellow';
        } else if (dayIdx === todayIdx && s && e) {
          if (currentDec >= e) {
            t.status = 'status-yellow';
          } else if (currentDec >= s && currentDec < e) {
            if (t.status === 'status-yellow') t.status = 'status-white';
          }
        }
      }
    });
  });

  dailyTasks.forEach(dt => {
    if (dt.status !== 'status-green' && dt.status !== 'status-red') {
      const s = dt.start || dt.hour;
      const e = dt.end || (s ? s + 1.5 : null);
      if (s && e) {
        if (currentDec >= e) {
          dt.status = 'status-yellow';
        } else if (currentDec >= s && currentDec < e) {
          if (dt.status === 'status-yellow') dt.status = 'status-white';
        }
      }
    }
  });

  saveActivePlanTasks(activeTasks);
  try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}
}

// ==========================================
// ۵. آغاز برنامه، احراز هویت، ساعت و اسپلش
// ==========================================
const splashScreen = document.getElementById('splash-screen');
const authScreen = document.getElementById('auth-screen');
const appContainer = document.getElementById('app-container');
const mainHeader = document.getElementById('main-header');
const mainFooter = document.getElementById('main-footer');
const authForm = document.getElementById('auth-form');
const guideModal = document.getElementById('guide-modal');
const headerUserName = document.getElementById('header-user-name');
const headerUserRole = document.getElementById('header-user-role');

function initApp() {
  applyAppLanguage(currentLang);

  if (!userProfile || !userProfile.name) {
    if (authScreen) authScreen.classList.remove('hidden');
    setTimeout(() => {
      if (guideModal) guideModal.classList.remove('hidden');
    }, 400);
  } else {
    updateHeader();
    if (mainHeader) mainHeader.classList.remove('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    if (mainFooter) mainFooter.classList.remove('hidden');
    if (!history.state) safeHistoryState('replace', { house: null }, window.location.pathname);

    checkLoginStreak();
    syncTodayTasks();
    autoUpdateTaskStatuses();
    updateStatsUI();
    initMultiPlanSelector();
  }
}

function startSplash() {
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        initApp();
      }, 400);
    } else {
      initApp();
    }
  }, 800);
}

setTimeout(() => {
  if (splashScreen && !splashScreen.classList.contains('hidden')) {
    splashScreen.style.opacity = '0';
    splashScreen.classList.add('hidden');
    initApp();
  }
}, 2500);

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startSplash);
} else {
  startSplash();
}

if (authForm) {
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const roleVal = document.getElementById('auth-role').value;
    userProfile = {
      name: document.getElementById('auth-name').value.trim(),
      roleValue: roleVal,
      roleText: getRoleText(roleVal),
      field: document.getElementById('auth-field').value.trim()
    };
    localStorage.setItem('focus_hub_user_v2', JSON.stringify(userProfile));

    if (authScreen) authScreen.classList.add('hidden');
    updateHeader();
    if (mainHeader) mainHeader.classList.remove('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    if (mainFooter) mainFooter.classList.remove('hidden');

    safeHistoryState('replace', { house: null }, window.location.pathname);
    checkLoginStreak();
    syncTodayTasks();
    autoUpdateTaskStatuses();
    updateStatsUI();
    initMultiPlanSelector();
  });
}

function updateHeader() {
  if (userProfile) {
    if (headerUserName) headerUserName.textContent = `👤 ${userProfile.name}`;
    if (headerUserRole) headerUserRole.textContent = `${getRoleText(userProfile.roleValue)} ${userProfile.field}`;
  }
}

function checkLoginStreak() {
  const todayStr = new Date().toDateString();
  if (appStats.lastLogin !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (appStats.lastLogin === yesterday.toDateString()) {
      appStats.streak = (appStats.streak || 0) + 1;
    } else {
      appStats.streak = 1;
    }
    appStats.lastLogin = todayStr;
    localStorage.setItem('focus_hub_stats_v2', JSON.stringify(appStats));
  }
}

function updateStatsUI() {
  if (document.getElementById('total-pomodoro-count')) document.getElementById('total-pomodoro-count').textContent = appStats.pomodoros || 0;
  if (document.getElementById('total-focus-minutes')) document.getElementById('total-focus-minutes').textContent = appStats.minutes || 0;
  if (document.getElementById('completed-tasks-count')) document.getElementById('completed-tasks-count').textContent = appStats.tasks || 0;
  if (document.getElementById('streak-days')) document.getElementById('streak-days').textContent = appStats.streak || 1;
}

function updateGlobalClock() {
  const timeEl = document.getElementById('global-live-time');
  if (!timeEl) return;
  const now = new Date();
  timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
setInterval(updateGlobalClock, 1000);
updateGlobalClock();

setInterval(() => {
  autoUpdateTaskStatuses();
  renderDailyTasks();
  if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
  else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
  renderAnalyticsDashboard();
}, 60000);

// ==========================================
// ۶. مدیریت تم، زبان و پروفایل
// ==========================================
const editModal = document.getElementById('edit-profile-modal');
const openEditBtn = document.getElementById('open-edit-btn');
const closeEditBtn = document.getElementById('close-edit-btn');
const editForm = document.getElementById('edit-profile-form');
const themeButtons = document.querySelectorAll('.theme-btn');

let savedTheme = localStorage.getItem('focus_hub_theme_v2') || 'neon';
let tempSelectedTheme = savedTheme;
document.documentElement.setAttribute('data-theme', savedTheme);

function updateThemeButtonsStyle(activeTheme) {
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-set-theme') === activeTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
updateThemeButtonsStyle(savedTheme);

if (openEditBtn && editModal) {
  openEditBtn.addEventListener('click', () => {
    if (userProfile) {
      document.getElementById('edit-name').value = userProfile.name || '';
      document.getElementById('edit-role').value = userProfile.roleValue || 'university';
      document.getElementById('edit-field').value = userProfile.field || '';
    }
    tempSelectedTheme = savedTheme;
    updateThemeButtonsStyle(tempSelectedTheme);
    editModal.classList.remove('hidden');
  });
}

themeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    tempSelectedTheme = e.currentTarget.getAttribute('data-set-theme');
    updateThemeButtonsStyle(tempSelectedTheme);
    document.documentElement.setAttribute('data-theme', tempSelectedTheme);
  });
});

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedLang = e.currentTarget.getAttribute('data-set-lang');
    applyAppLanguage(selectedLang);
  });
});

if (closeEditBtn && editModal) {
  closeEditBtn.addEventListener('click', () => {
    tempSelectedTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButtonsStyle(savedTheme);
    editModal.classList.add('hidden');
  });
}

if (editForm) {
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const roleVal = document.getElementById('edit-role').value;
    userProfile = {
      name: document.getElementById('edit-name').value.trim(),
      roleValue: roleVal,
      roleText: getRoleText(roleVal),
      field: document.getElementById('edit-field').value.trim()
    };
    try { localStorage.setItem('focus_hub_user_v2', JSON.stringify(userProfile)); } catch (err) {}
    updateHeader();

    savedTheme = tempSelectedTheme;
    try { localStorage.setItem('focus_hub_theme_v2', savedTheme); } catch (err) {}
    document.documentElement.setAttribute('data-theme', savedTheme);
    editModal.classList.add('hidden');
  });
}

// ==========================================
// ۷. ناوبری بین میدان اصلی و خانه‌ها
// ==========================================
const mainHubGrid = document.getElementById('main-hub');
const hubCards = document.querySelectorAll('.hub-card');
const backBtns = document.querySelectorAll('.back-to-hub-btn');
const housePages = document.querySelectorAll('.house-page');

function navigateTo(targetId, pushHistory = true) {
  if (mainHubGrid) mainHubGrid.classList.add('hidden');
  housePages.forEach(page => page.classList.add('hidden'));
  const targetPage = document.getElementById(targetId);
  if (targetPage) targetPage.classList.remove('hidden');
  if (pushHistory) safeHistoryState('push', { house: targetId }, '#' + targetId);

  if (targetId === 'house-planner') {
    switchHouse2View(currentWeeklyMode);
  } else if (targetId === 'house-analytics') {
    renderAnalyticsDashboard();
  }
}

function navigateHome(pushHistory = true) {
  housePages.forEach(page => page.classList.add('hidden'));
  if (mainHubGrid) mainHubGrid.classList.remove('hidden');
  if (pushHistory) safeHistoryState('push', { house: null }, window.location.pathname);
}

hubCards.forEach(card => {
  card.addEventListener('click', () => navigateTo(card.getAttribute('data-target'), true));
});

backBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.state && history.state.house) history.back();
    else navigateHome(true);
  });
});

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.house) navigateTo(e.state.house, false);
  else navigateHome(false);
});

// ==========================================
// ۸. تایمر پومودورو و مطالعه آزاد (Freeflow)
// ==========================================
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('timer-progress-bar');
const catStatusBadge = document.getElementById('cat-status-badge');
const startBtn = document.getElementById('timer-start-btn');
const pauseBtn = document.getElementById('timer-pause-btn');
const resetBtn = document.getElementById('timer-reset-btn');
const studySelect = document.getElementById('study-time-select');
const breakSelect = document.getElementById('break-time-select');
const freeflowBtn = document.getElementById('freeflow-mode-btn');

let totalTime = studySelect ? parseInt(studySelect.value, 10) : 1500;
let timeLeft = totalTime;
let stopwatchSeconds = 0;
let isStopwatchMode = false;
let isRunning = false;
let timerInterval = null;
let currentPhase = 'study';
let endTime = 0;
let stopwatchStartTime = 0;

function lockTimerUI(isLocked) {
  if (isStopwatchMode) {
    if (studySelect) studySelect.disabled = true;
    if (breakSelect) breakSelect.disabled = true;
  } else {
    if (studySelect) studySelect.disabled = isLocked;
    if (breakSelect) breakSelect.disabled = isLocked;
  }
  if (freeflowBtn) freeflowBtn.disabled = isLocked;
}

if (timerDisplay) updateTimerDisplay();

if (studySelect) {
  studySelect.addEventListener('change', () => {
    if (isRunning) pauseTimer();
    isStopwatchMode = false;
    if (freeflowBtn) freeflowBtn.classList.remove('active');
    currentPhase = 'study';
    totalTime = parseInt(studySelect.value, 10);
    timeLeft = totalTime;
    updateTimerDisplay();
    if (progressBar) progressBar.style.width = '0%';
    updateCatStatus(currentLang === 'fa' ? `زمان مطالعه: ${Math.floor(totalTime / 60)} دقیقه 🐾` : `Study Session: ${Math.floor(totalTime / 60)} mins 🐾`);
  });
}

if (freeflowBtn) {
  freeflowBtn.addEventListener('click', () => {
    if (isRunning) pauseTimer();
    isStopwatchMode = !isStopwatchMode;

    if (isStopwatchMode) {
      freeflowBtn.classList.add('active');
      if (studySelect) studySelect.disabled = true;
      if (breakSelect) breakSelect.disabled = true;
      stopwatchSeconds = 0;
      updateStopwatchDisplay();
      if (progressBar) progressBar.style.width = '100%';
      updateCatStatus(currentLang === 'fa' ? 'حالت آزاد (کرنومتر) فعال شد ⏱️🐾' : 'Freeflow Stopwatch Active ⏱️🐾');
    } else {
      freeflowBtn.classList.remove('active');
      if (studySelect) studySelect.disabled = false;
      if (breakSelect) breakSelect.disabled = false;
      currentPhase = 'study';
      totalTime = studySelect ? parseInt(studySelect.value, 10) : 1500;
      timeLeft = totalTime;
      updateTimerDisplay();
      if (progressBar) progressBar.style.width = '0%';
      updateCatStatus(currentLang === 'fa' ? `حالت پومودورو: ${Math.floor(totalTime / 60)} دقیقه 🐾` : `Pomodoro Session: ${Math.floor(totalTime / 60)} mins 🐾`);
    }
  });
}

if (startBtn) startBtn.addEventListener('click', startTimer);
if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  lockTimerUI(true);

  if (isStopwatchMode) {
    updateCatStatus(currentLang === 'fa' ? 'مطالعه آزاد در جریان است... 🔥' : 'Freeflow focus running... 🔥');
    stopwatchStartTime = Date.now() - (stopwatchSeconds * 1000);
    timerInterval = setInterval(() => {
      stopwatchSeconds = Math.floor((Date.now() - stopwatchStartTime) / 1000);
      updateStopwatchDisplay();
    }, 250);
  } else {
    updateCatStatus(currentPhase === 'study' ? (currentLang === 'fa' ? 'در حال تمرکز عمیق... 🎧' : 'Deep focus underway... 🎧') : (currentLang === 'fa' ? 'در حال استراحت... ☕' : 'Taking a break... ☕'));
    endTime = Date.now() + (timeLeft * 1000);
    timerInterval = setInterval(() => {
      timeLeft = Math.round((endTime - Date.now()) / 1000);
      if (timeLeft > 0) {
        updateTimerDisplay();
        updateProgressBar();
      } else {
        timeLeft = 0;
        handleTimerCompletion();
      }
    }, 250);
  }
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  lockTimerUI(false);
  updateCatStatus(currentLang === 'fa' ? 'تایمر متوقف شد ⏸️' : 'Timer Paused ⏸️');
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  lockTimerUI(false);

  if (isStopwatchMode) {
    const earnedMins = Math.floor(stopwatchSeconds / 60);
    if (earnedMins > 0) {
      appStats.minutes = (appStats.minutes || 0) + earnedMins;
      localStorage.setItem('focus_hub_stats_v2', JSON.stringify(appStats));
      updateStatsUI();
      updateCatStatus(currentLang === 'fa' ? `خسته نباشی! ${earnedMins} دقیقه تمرکز در رکوردها ثبت شد 🔥🐾` : `Great work! ${earnedMins} mins logged 🔥🐾`);
    } else {
      updateCatStatus(currentLang === 'fa' ? 'کرنومتر آزاد صفر شد ⏱️🐾' : 'Stopwatch reset ⏱️🐾');
    }
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
    if (progressBar) progressBar.style.width = '100%';
  } else {
    currentPhase = 'study';
    totalTime = parseInt(studySelect.value, 10);
    timeLeft = totalTime;
    updateTimerDisplay();
    if (progressBar) progressBar.style.width = '0%';
    updateCatStatus(currentLang === 'fa' ? 'تایمر پومودورو ریست شد 🐾' : 'Pomodoro reset 🐾');
  }
}

function handleTimerCompletion() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  lockTimerUI(false);

  if (currentPhase === 'study') {
    appStats.pomodoros = (appStats.pomodoros || 0) + 1;
    appStats.minutes = (appStats.minutes || 0) + Math.floor(totalTime / 60);
    localStorage.setItem('focus_hub_stats_v2', JSON.stringify(appStats));
    updateStatsUI();

    currentPhase = 'break';
    totalTime = parseInt(breakSelect.value, 10);
    timeLeft = totalTime;
    updateCatStatus(currentLang === 'fa' ? 'پارت مطالعه تمام شد! نوبت استراحته ☕' : 'Study block completed! Time for a break ☕');
  } else {
    currentPhase = 'study';
    totalTime = parseInt(studySelect.value, 10);
    timeLeft = totalTime;
    updateCatStatus(currentLang === 'fa' ? 'استراحت تمام شد؛ پارت بعدی؟ 🐾' : 'Break ended; ready for next block? 🐾');
  }
  updateTimerDisplay();
  if (progressBar) progressBar.style.width = '0%';
}

function updateTimerDisplay() {
  const minEl = document.getElementById('timer-minutes');
  const secEl = document.getElementById('timer-seconds');
  if (!minEl || !secEl) return;
  minEl.textContent = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  secEl.textContent = String(timeLeft % 60).padStart(2, '0');
}

function updateStopwatchDisplay() {
  const minEl = document.getElementById('timer-minutes');
  const secEl = document.getElementById('timer-seconds');
  if (!minEl || !secEl) return;
  minEl.textContent = String(Math.floor(stopwatchSeconds / 60)).padStart(2, '0');
  secEl.textContent = String(stopwatchSeconds % 60).padStart(2, '0');
}

function updateProgressBar() {
  if (!progressBar || isStopwatchMode) return;
  progressBar.style.width = `${((totalTime - timeLeft) / totalTime) * 100}%`;
}

function updateCatStatus(text) {
  if (!catStatusBadge) return;
  catStatusBadge.textContent = text;
}

const catQuotes = {
  fa: [
    'میو! حواست به درست باشه رفیق، من هواتو دارم 🐾',
    'میو! تایمر رو استارت بزن و عمیق برو تو دل کار 🔥',
    'یه گربه باهوش همیشه پیوسته تمرکز می‌کنه؛ تو هم می‌تونی 🎧',
    'میو! خسته شدی یه لیوان آب بخور و برگرد سر میز 💧',
    'میو! امروز رکورد تمرکز هفتگیت رو جابه‌جا می‌کنی 🚀'
  ],
  en: [
    'Meow! Stay focused on your goals, I have your back 🐾',
    'Meow! Hit start and dive deep into your work 🔥',
    'A smart cat stays consistent; you can do it too 🎧',
    'Meow! Drink some water and get back to business 💧',
    'Meow! You are breaking your study streak today 🚀'
  ]
};

function triggerCatReaction(el) {
  if (!el) return;
  el.classList.remove('cat-jump-anim');
  void el.offsetWidth;
  el.classList.add('cat-jump-anim');
  const list = catQuotes[currentLang] || catQuotes.fa;
  const quote = list[Math.floor(Math.random() * list.length)];
  updateCatStatus(quote);
}

document.querySelectorAll('.header-cat-mini, .timer-cat-mascot, .catmodoro-mascot-box').forEach(cat => {
  cat.addEventListener('click', () => triggerCatReaction(cat));
});

// ==========================================
// ۹. مودال‌های راهنما
// ==========================================
function bindGuideModal(btnId, modalId, closeId) {
  const btn = document.getElementById(btnId);
  const modal = document.getElementById(modalId);
  const close = document.getElementById(closeId);
  if (btn && modal) btn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (close && modal) close.addEventListener('click', () => modal.classList.add('hidden'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}

bindGuideModal('open-guide-btn', 'guide-modal', 'close-guide-btn');
bindGuideModal('open-focus-guide-btn', 'focus-desk-guide-modal', 'close-focus-guide-btn');
bindGuideModal('open-planner-guide-btn', 'planner-guide-modal', 'close-planner-guide-btn');
bindGuideModal('open-library-guide-btn', 'library-guide-modal', 'close-library-guide-btn');

// ==========================================
// ۱۰. مودال جزئیات، وضعیت و یادداشت وظیفه
// ==========================================
const taskDetailModal = document.getElementById('task-detail-modal');
const closeTaskDetailBtn = document.getElementById('close-task-detail-btn');
const modalDetailTitle = document.getElementById('modal-detail-title');
const modalDetailTime = document.getElementById('modal-detail-time');
const modalDetailStatusSelect = document.getElementById('modal-detail-status-select');
const modalDetailNotes = document.getElementById('modal-detail-notes');
const modalSaveDetailBtn = document.getElementById('modal-save-detail-btn');
const modalDeleteTaskBtn = document.getElementById('modal-delete-task-btn');

function openTaskDetails(task, dayKey = null) {
  if (!task || !taskDetailModal) return;
  currentInspectingTaskId = task.calId || task.id;
  currentInspectingDay = dayKey || getTodayCalKey();

  if (modalDetailTitle) modalDetailTitle.textContent = task.text || 'Untitled';

  const start = task.start || task.hour;
  const end = task.end;
  if (modalDetailTime) {
    if (start && end) {
      modalDetailTime.textContent = `${decimalToTimeString(start)} - ${decimalToTimeString(end)}`;
    } else if (start) {
      modalDetailTime.textContent = `${start}:00`;
    } else {
      modalDetailTime.textContent = '--:--';
    }
  }

  if (modalDetailStatusSelect) modalDetailStatusSelect.value = task.status || 'status-white';
  if (modalDetailNotes) modalDetailNotes.value = task.notes || '';
  taskDetailModal.classList.remove('hidden');
}

if (closeTaskDetailBtn && taskDetailModal) {
  closeTaskDetailBtn.addEventListener('click', () => taskDetailModal.classList.add('hidden'));
}

if (modalSaveDetailBtn) {
  modalSaveDetailBtn.addEventListener('click', () => {
    if (!currentInspectingTaskId) return;
    const newStatus = modalDetailStatusSelect.value;
    const newNotes = modalDetailNotes ? modalDetailNotes.value.trim() : '';

    const dailyTarget = dailyTasks.find(t => t.id === currentInspectingTaskId || t.calId === currentInspectingTaskId);
    if (dailyTarget) {
      dailyTarget.status = newStatus;
      dailyTarget.notes = newNotes;
      dailyTarget.completed = (newStatus === 'status-green');
      try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}
      renderDailyTasks();
    }

    const activeTasks = getActivePlanTasks();
    for (let d in activeTasks) {
      let found = activeTasks[d].find(it => it.id === currentInspectingTaskId);
      if (found) {
        found.status = newStatus;
        found.notes = newNotes;
        break;
      }
    }
    saveActivePlanTasks(activeTasks);

    if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
    else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
    taskDetailModal.classList.add('hidden');
  });
}

if (modalDeleteTaskBtn) {
  modalDeleteTaskBtn.addEventListener('click', () => {
    if (!currentInspectingTaskId) return;
    if (confirm(currentLang === 'fa' ? 'این برنامه از جدول هفتگی حذف شود؟' : 'Delete this task from schedule?')) {
      dailyTasks = dailyTasks.filter(t => t.id !== currentInspectingTaskId && t.calId !== currentInspectingTaskId);
      try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}
      renderDailyTasks();

      const activeTasks = getActivePlanTasks();
      for (let d in activeTasks) {
        activeTasks[d] = activeTasks[d].filter(it => it.id !== currentInspectingTaskId);
      }
      saveActivePlanTasks(activeTasks);

      if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
      else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
      renderAnalyticsDashboard();
      taskDetailModal.classList.add('hidden');
    }
  });
}

// ==========================================
// ۱۱. خانه ۱: تکالیف امروز
// ==========================================
const taskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const taskStartTime = document.getElementById('task-start-time');
const taskEndTime = document.getElementById('task-end-time');
const taskStatusInput = document.getElementById('task-status-input');
const tasksList = document.getElementById('tasks-list');
const taskCounter = document.getElementById('task-counter');
const activeTaskWrapper = document.getElementById('active-task-wrapper');
const activeTaskText = document.getElementById('active-focus-task-text');

function getTodayCalKey() {
  const map = { 6: 'sat', 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' };
  return map[new Date().getDay()];
}

function syncTodayTasks() {
  const todayKey = getTodayCalKey();
  const activeTasks = getActivePlanTasks();
  const todayCalTasks = (activeTasks && activeTasks[todayKey]) ? activeTasks[todayKey] : [];

  todayCalTasks.forEach(calTask => {
    let exists = dailyTasks.find(dt => dt.calId === calTask.id);
    if (!exists) {
      dailyTasks.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        calId: calTask.id,
        text: calTask.text,
        start: calTask.start || calTask.hour || null,
        end: calTask.end || (calTask.start ? calTask.start + 1.5 : null),
        hour: calTask.start || calTask.hour || null,
        category: 'calendar',
        status: calTask.status || 'status-white',
        notes: calTask.notes || '',
        completed: (calTask.status === 'status-green')
      });
    } else {
      exists.text = calTask.text;
      exists.start = calTask.start;
      exists.end = calTask.end;
      exists.status = calTask.status;
      exists.notes = calTask.notes || '';
      exists.completed = (calTask.status === 'status-green');
    }
  });

  try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}
  renderDailyTasks();
}

if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput ? taskInput.value.trim() : '';
    if (!text) return;

    let startDec = null;
    let endDec = null;

    if (taskStartTime && taskStartTime.value && taskEndTime && taskEndTime.value) {
      const [sh, sm] = taskStartTime.value.split(':').map(Number);
      let [eh, em] = taskEndTime.value.split(':').map(Number);
      if ((eh === 23 && em === 59) || (eh === 0 && em === 0)) eh = 24;

      startDec = sh + (sm / 60);
      endDec = (eh === 24 && em === 59) ? 24 : (eh + (em / 60));

      if (endDec <= startDec) {
        alert(currentLang === 'fa' ? 'ساعت پایان باید بعد از ساعت شروع باشد!' : 'End time must be after start time!');
        return;
      }
    }

    const stVal = taskStatusInput ? taskStatusInput.value : 'status-white';
    const todayKey = getTodayCalKey();
    const sharedId = Date.now();
    const activeTasks = getActivePlanTasks();

    if (startDec !== null && endDec !== null) {
      if (!activeTasks[todayKey]) activeTasks[todayKey] = [];
      activeTasks[todayKey].push({
        id: sharedId,
        text: text,
        start: startDec,
        end: endDec,
        hour: Math.floor(startDec),
        status: stVal,
        notes: ''
      });
      saveActivePlanTasks(activeTasks);
    }

    dailyTasks.unshift({
      id: sharedId,
      calId: sharedId,
      text: text,
      start: startDec,
      end: endDec,
      hour: startDec ? Math.floor(startDec) : null,
      category: 'study',
      status: stVal,
      notes: '',
      completed: (stVal === 'status-green')
    });
    try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (err) {}

    if (taskInput) taskInput.value = '';
    if (taskStartTime) taskStartTime.value = '';
    if (taskEndTime) taskEndTime.value = '';
    renderDailyTasks();
    if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
    else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
    renderAnalyticsDashboard();
  });
}

function renderDailyTasks() {
  if (!tasksList) return;
  tasksList.innerHTML = '';

  if (dailyTasks.length === 0) {
    tasksList.innerHTML = `<li style="text-align:center; color:var(--text-muted); padding:1rem; font-size:0.85rem;">${i18nDOM[currentLang].emptyTasks}</li>`;
    if (taskCounter) taskCounter.textContent = `0 ${i18nDOM[currentLang].remainingWord}`;
    return;
  }

  dailyTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.status || 'status-white'} ${task.completed ? 'completed' : ''}`;

    const isPinned = (task.id === activeFocusTaskId);
    const start = task.start || task.hour;
    const end = task.end;
    let timeLabel = start && end ? `<span class="task-time-range-badge">⏱️ ${decimalToTimeString(start)} - ${decimalToTimeString(end)}</span>` : '';
    let notesLabel = task.notes ? `<span class="task-has-notes-badge" title="${task.notes}">📝 یادداشت</span>` : '';

    let statusPillText = '⚪';
    if (task.status === 'status-green') statusPillText = '🟢';
    else if (task.status === 'status-yellow') statusPillText = '🟡';
    else if (task.status === 'status-red') statusPillText = '🔴';
    else if (task.status === 'status-blue') statusPillText = '🔵';

    li.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <button type="button" class="pin-task-btn" data-id="${task.id}" title="Pin on Timer">${isPinned ? '🎯' : '📌'}</button>
        <button type="button" class="status-toggle-pill" data-id="${task.id}" title="Change status">${statusPillText}</button>
      </div>
      <div class="task-right-side" style="display:flex; align-items:center; gap:8px; flex:1; justify-content:flex-end; cursor:pointer;">
        ${notesLabel}
        ${timeLabel}
        <span class="task-text">${task.text}</span>
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
      </div>
    `;

    li.querySelector('.task-right-side').addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      openTaskDetails(task, getTodayCalKey());
    });

    tasksList.appendChild(li);
  });

  const remaining = dailyTasks.filter(t => !t.completed).length;
  if (taskCounter) taskCounter.textContent = `${remaining} ${i18nDOM[currentLang].remainingWord}`;

  document.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const id = Number(e.target.getAttribute('data-id'));
      const target = dailyTasks.find(t => t.id === id);
      if (target) {
        target.completed = e.target.checked;
        target.status = target.completed ? 'status-green' : 'status-white';
        syncStatusToWeekly(target.calId || target.id, target.status);
        if (target.completed) appStats.tasks = (appStats.tasks || 0) + 1;
        try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (err) {}
        updateStatsUI();
        renderDailyTasks();
        renderAnalyticsDashboard();
      }
    });
  });

  document.querySelectorAll('.status-toggle-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.getAttribute('data-id'));
      const target = dailyTasks.find(t => t.id === id);
      if (target) {
        const cycle = ['status-white', 'status-green', 'status-red', 'status-blue'];
        let curIdx = cycle.indexOf(target.status);
        if (curIdx === -1) curIdx = 0;
        const next = cycle[(curIdx + 1) % cycle.length];
        target.status = next;
        target.completed = (next === 'status-green');
        syncStatusToWeekly(target.calId || target.id, next);
        try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (err) {}
        renderDailyTasks();
      }
    });
  });

  document.querySelectorAll('.pin-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.getAttribute('data-id'));
      const target = dailyTasks.find(t => t.id === id);
      if (target) {
        if (activeFocusTaskId === id) {
          activeFocusTaskId = null;
          if (activeTaskWrapper) activeTaskWrapper.style.display = 'none';
        } else {
          activeFocusTaskId = id;
          if (activeTaskWrapper && activeTaskText) {
            activeTaskText.textContent = `🎯 ${target.text}`;
            activeTaskWrapper.style.display = 'block';
          }
        }
        renderDailyTasks();
      }
    });
  });
}

function syncStatusToWeekly(calId, newStatus) {
  const activeTasks = getActivePlanTasks();
  for (let d in activeTasks) {
    let found = activeTasks[d].find(it => it.id === calId);
    if (found) {
      found.status = newStatus;
      break;
    }
  }
  saveActivePlanTasks(activeTasks);
  if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
  else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
}

// ==========================================
// ۱۲. خانه ۲: چندبرنامه‌ای، پرینت و سوئیچر
// ==========================================
const matrixBoard = document.getElementById('termchin-matrix-board');
const weeklyContainer = document.getElementById('weekly-view-container');
const btnViewTimeline = document.getElementById('view-mode-timeline-btn');
const btnViewTasks = document.getElementById('view-mode-tasks-btn');

const addWeeklyModal = document.getElementById('add-weekly-modal');
const openAddWeeklyBtn = document.getElementById('open-add-weekly-btn');
const closeWeeklyModalBtn = document.getElementById('close-weekly-modal-btn');
const weeklyForm = document.getElementById('weekly-task-form');

function switchHouse2View(mode) {
  currentWeeklyMode = mode;
  [btnViewTimeline, btnViewTasks].forEach(btn => btn?.classList.remove('active'));

  if (mode === 'timeline') {
    btnViewTimeline?.classList.add('active');
    matrixBoard?.classList.remove('hidden');
    weeklyContainer?.classList.add('hidden');
    renderTermchinMatrix();
  } else if (mode === 'kanban') {
    btnViewTasks?.classList.add('active');
    matrixBoard?.classList.add('hidden');
    weeklyContainer?.classList.remove('hidden');
    renderWeeklyBoard();
  }
}

if (btnViewTimeline && btnViewTasks) {
  btnViewTimeline.addEventListener('click', () => switchHouse2View('timeline'));
  btnViewTasks.addEventListener('click', () => switchHouse2View('kanban'));
}

let isMultiPlanEventsBound = false;

function initMultiPlanSelector() {
  const triggerBtn = document.getElementById('plan-dropdown-trigger-btn');
  const menu = document.getElementById('plan-dropdown-menu');
  const planNameEl = document.getElementById('current-active-plan-name');
  const planCountEl = document.getElementById('current-active-plan-count');

  if (!triggerBtn || !menu) return;

  const currentPlan = multiPlanState.plans[multiPlanState.activePlanId] || multiPlanState.plans.main;
  let totalTasks = 0;
  for (let d in currentPlan.tasks) totalTasks += (currentPlan.tasks[d] || []).length;

  if (planNameEl) planNameEl.textContent = currentPlan.name;
  if (planCountEl) planCountEl.textContent = `${totalTasks} ${i18nDOM[currentLang].tasksWord}`;

  let itemsHtml = '';
  for (let planId in multiPlanState.plans) {
    const plan = multiPlanState.plans[planId];
    const isActive = (planId === multiPlanState.activePlanId);
    let planTasksCount = 0;
    for (let d in plan.tasks) planTasksCount += (plan.tasks[d] || []).length;

    itemsHtml += `
      <div class="plan-menu-item ${isActive ? 'active' : ''}" data-plan-id="${planId}">
        <span>📑 ${plan.name}</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="plan-sub-count">${planTasksCount} ${i18nDOM[currentLang].tasksWord}</span>
          ${isActive ? '<span class="plan-item-tag">فعال</span>' : ''}
        </div>
      </div>
    `;
  }

  itemsHtml += `
    <div class="plan-menu-divider"></div>
    <div class="plan-menu-item add-plan-action" id="create-new-plan-btn">
      <span>➕ ایجاد برنامه جدید...</span>
    </div>
  `;

  menu.innerHTML = itemsHtml;

  menu.querySelectorAll('.plan-menu-item:not(.add-plan-action)').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const planId = item.getAttribute('data-plan-id');
      if (multiPlanState.plans[planId]) {
        multiPlanState.activePlanId = planId;
        try { localStorage.setItem('focus_hub_multi_plans_v1', JSON.stringify(multiPlanState)); } catch (err) {}
        
        menu.classList.add('hidden');
        initMultiPlanSelector();
        syncTodayTasks();
        if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
        else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
        renderAnalyticsDashboard();
        updateCatStatus(currentLang === 'fa' ? `به سناریوی «${multiPlanState.plans[planId].name}» سوییچ شد! 📑🐾` : `Switched to "${multiPlanState.plans[planId].name}"! 📑🐾`);
      }
    });
  });

  const createBtn = document.getElementById('create-new-plan-btn');
  if (createBtn) {
    createBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pName = prompt(currentLang === 'fa' ? 'نام سناریو یا برنامه جدید را وارد کنید:' : 'Enter name for new plan scenario:');
      if (pName && pName.trim()) {
        const newId = 'plan_' + Date.now();
        multiPlanState.plans[newId] = {
          name: pName.trim(),
          tasks: { sat: [], sun: [], mon: [], tue: [], wed: [], thu: [], fri: [] }
        };
        multiPlanState.activePlanId = newId;
        try { localStorage.setItem('focus_hub_multi_plans_v1', JSON.stringify(multiPlanState)); } catch (err) {}
        
        menu.classList.add('hidden');
        initMultiPlanSelector();
        syncTodayTasks();
        if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
        else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
        renderAnalyticsDashboard();
      }
    });
  }

  if (!isMultiPlanEventsBound) {
    isMultiPlanEventsBound = true;

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== triggerBtn) {
        menu.classList.add('hidden');
      }
    });
  }
}

const exportScheduleBtn = document.getElementById('export-schedule-btn');
if (exportScheduleBtn) {
  exportScheduleBtn.addEventListener('click', () => {
    updateCatStatus(currentLang === 'fa' ? 'در حال آماده‌سازی فایل خروجی تقویم... 📸' : 'Preparing calendar export... 📸');
    setTimeout(() => {
      window.print();
    }, 200);
  });
}

const weeklyStartH = document.getElementById('weekly-start-h');
const weeklyStartM = document.getElementById('weekly-start-m');
const weeklyEndH = document.getElementById('weekly-end-h');
const weeklyEndM = document.getElementById('weekly-end-m');
const weeklyDurationBadge = document.getElementById('weekly-duration-badge');
const modalConflictBanner = document.getElementById('modal-conflict-banner');

function updateTimePickerOptions() {
  if (!weeklyStartH || !weeklyEndH) return;
  weeklyStartH.innerHTML = '';
  weeklyEndH.innerHTML = '';

  for (let h = TC_MIN_HOUR; h < TC_MAX_HOUR; h++) {
    const val = String(h).padStart(2, '0');
    weeklyStartH.innerHTML += `<option value="${val}">${val}</option>`;
  }
  for (let h = TC_MIN_HOUR + 1; h <= TC_MAX_HOUR; h++) {
    const val = String(h).padStart(2, '0');
    weeklyEndH.innerHTML += `<option value="${val}">${val}</option>`;
  }
}

function setStudentTimePicker(startDec, endDec) {
  if (!weeklyStartH) return;
  let sH = Math.floor(startDec);
  let sM = Math.round((startDec - sH) * 60);
  sM = sM >= 45 ? 45 : (sM >= 30 ? 30 : (sM >= 15 ? 15 : 0));

  let eH = Math.floor(endDec);
  let eM = Math.round((endDec - eH) * 60);
  if (eH === 24) eM = 0;
  else eM = eM >= 45 ? 45 : (eM >= 30 ? 30 : (eM >= 15 ? 15 : 0));

  weeklyStartH.value = String(sH).padStart(2, '0');
  weeklyStartM.value = String(sM).padStart(2, '0');
  weeklyEndH.value = String(eH).padStart(2, '0');
  weeklyEndM.value = String(eM).padStart(2, '0');

  updateModalConflictStatus();
}

function getStudentTimeDecimals() {
  if (!weeklyStartH) return { startDec: 9, endDec: 10.5 };
  const sh = Number(weeklyStartH.value);
  const sm = Number(weeklyStartM.value);
  let eh = Number(weeklyEndH.value);
  const em = Number(weeklyEndM.value);
  if (eh === 24 && em > 0) eh = 24;

  return {
    startDec: sh + (sm / 60),
    endDec: eh === 24 ? 24 : eh + (em / 60)
  };
}

function updateModalConflictStatus() {
  const { startDec, endDec } = getStudentTimeDecimals();
  const durMins = Math.round((endDec - startDec) * 60);

  if (weeklyDurationBadge) {
    if (durMins <= 0) {
      weeklyDurationBadge.textContent = currentLang === 'fa' ? 'خطا در بازه زمان' : 'Time error';
      weeklyDurationBadge.style.color = 'var(--accent-red)';
      weeklyDurationBadge.style.borderColor = 'var(--accent-red)';
    } else {
      const hours = Math.floor(durMins / 60);
      const mins = durMins % 60;
      let durText = '';
      if (hours > 0) durText += `${hours} ${currentLang === 'fa' ? 'ساعت' : 'hr'} `;
      if (mins > 0) durText += `${mins} ${currentLang === 'fa' ? 'دقیقه' : 'min'}`;
      weeklyDurationBadge.textContent = durText.trim() || '0 min';
      weeklyDurationBadge.style.color = 'var(--accent-cyan)';
      weeklyDurationBadge.style.borderColor = 'var(--accent-cyan)';
    }
  }

  const dayKey = document.getElementById('weekly-day-select')?.value || 'sat';
  const activeTasks = getActivePlanTasks();
  const list = activeTasks[dayKey] || [];
  const conflict = list.find(c => {
    const s = c.start || c.hour;
    const e = c.end || (s + 1.5);
    return startDec < e && endDec > s;
  });

  const card = document.querySelector('.student-time-picker-card');
  if (conflict && durMins > 0) {
    card?.classList.add('has-conflict');
    if (modalConflictBanner) {
      modalConflictBanner.className = 'conflict-banner-box has-conflict';
      modalConflictBanner.innerHTML = `<span class="conflict-icon">⚠️</span><span class="conflict-text">${currentLang === 'fa' ? `<strong>تداخل زمانی!</strong> با درس «${conflict.text}» (${decimalToTimeString(conflict.start)} تا ${decimalToTimeString(conflict.end)})` : `<strong>Conflict!</strong> with "${conflict.text}" (${decimalToTimeString(conflict.start)} - ${decimalToTimeString(conflict.end)})`}</span>`;
    }
  } else {
    card?.classList.remove('has-conflict');
    if (modalConflictBanner) {
      modalConflictBanner.className = 'conflict-banner-box no-conflict';
      modalConflictBanner.innerHTML = `<span class="conflict-icon">✅</span><span class="conflict-text">${currentLang === 'fa' ? 'این بازه زمانی کاملاً آزاد است و تداخلی ندارد.' : 'This time slot is free and has no conflict.'}</span>`;
    }
  }
}

[weeklyStartH, weeklyStartM, weeklyEndH, weeklyEndM].forEach(sel => {
  if (sel) sel.addEventListener('change', updateModalConflictStatus);
});

const weeklyDaySelectEl = document.getElementById('weekly-day-select');
if (weeklyDaySelectEl) {
  weeklyDaySelectEl.addEventListener('change', updateModalConflictStatus);
}

document.querySelectorAll('.preset-pill-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const addMins = Number(btn.getAttribute('data-mins'));
    if (!addMins) return;
    const { startDec } = getStudentTimeDecimals();
    let newEndDec = startDec + (addMins / 60);
    if (newEndDec > TC_MAX_HOUR) newEndDec = TC_MAX_HOUR;
    setStudentTimePicker(startDec, newEndDec);
  });
});

// ==========================================
// ۱۳. رندر جدول ماتریسی چیدمان برنامه
// ==========================================
function renderTermchinMatrix() {
  if (!matrixBoard) return;

  if (currentWeeklyMode === 'timeline') {
    matrixBoard.classList.remove('hidden');
    if (weeklyContainer) weeklyContainer.classList.add('hidden');
  } else {
    matrixBoard.classList.add('hidden');
  }

  let totalHours = 0;
  let totalTasks = 0;
  let hasConflict = false;
  const days = getDaysList();
  const activeTasks = getActivePlanTasks();

  days.forEach(day => {
    const list = activeTasks[day.key] || [];
    totalTasks += list.length;
    list.forEach(c => {
      if (typeof c.start !== 'number') c.start = c.hour ? Number(c.hour) : 8;
      if (typeof c.end !== 'number') c.end = c.start + 1.5;
      totalHours += Math.max(0.5, c.end - c.start);
    });

    for (let i = 0; i < list.length; i++) {
      list[i].hasConflict = false;
      for (let j = 0; j < list.length; j++) {
        if (i !== j) {
          const a = list[i];
          const b = list[j];
          if (a.start < b.end && a.end > b.start) {
            a.hasConflict = true;
            hasConflict = true;
          }
        }
      }
    }
  });

  const totalHoursEl = document.getElementById('weekly-total-hours');
  const totalCoursesEl = document.getElementById('weekly-total-courses');
  const conflictChip = document.getElementById('conflict-status-chip');
  if (totalHoursEl) totalHoursEl.textContent = `${Math.round(totalHours * 10) / 10} ${i18nDOM[currentLang].hoursWord}`;
  if (totalCoursesEl) totalCoursesEl.textContent = `${totalTasks} ${i18nDOM[currentLang].tasksWord}`;
  if (conflictChip) {
    if (hasConflict) {
      conflictChip.innerHTML = i18nDOM[currentLang].hasConflict;
      conflictChip.style.color = 'var(--accent-red)';
    } else {
      conflictChip.innerHTML = i18nDOM[currentLang].noConflict;
      conflictChip.style.color = 'var(--accent-green)';
    }
  }

  let html = `<div class="termchin-grid-layout">`;
  html += `<div class="termchin-days-column"><div class="termchin-corner-cell">${currentLang === 'fa' ? 'روز / ساعت' : 'Day / Hour'}</div>`;
  days.forEach(day => {
    const count = (activeTasks[day.key] || []).length;
    html += `<div class="termchin-day-header-cell"><span class="termchin-day-name">${day.name}</span><span class="termchin-day-count">${count} ${i18nDOM[currentLang].tasksWord}</span></div>`;
  });
  html += `</div><div class="termchin-timeline-area"><div class="termchin-hours-header">`;
  for (let h = TC_MIN_HOUR; h < TC_MAX_HOUR; h++) {
    html += `<div class="termchin-hour-label" dir="ltr">${(h < 10 ? '0' + h : h)}:00</div>`;
  }
  html += `</div>`;

  days.forEach(day => {
    html += `<div class="termchin-day-row" data-day="${day.key}">`;
    const dayCourses = activeTasks[day.key] || [];
    dayCourses.forEach(c => {
      const start = Math.max(TC_MIN_HOUR, c.start || 8);
      const end = Math.min(TC_MAX_HOUR, c.end || (start + 1.5));
      const rightPercent = ((start - TC_MIN_HOUR) / TC_TOTAL_HOURS) * 100;
      const widthPercent = Math.max(3.5, ((end - start) / TC_TOTAL_HOURS) * 100);
      const conflictRing = c.hasConflict ? 'border-color: #f85149 !important; box-shadow: 0 0 15px rgba(248,81,73,0.6);' : '';
      const notesDot = c.notes ? '📝 ' : '';

      html += `
        <div class="termchin-card ${c.status || 'status-white'}" style="${currentLang === 'fa' ? 'right' : 'left'}: ${rightPercent}%; width: ${widthPercent}%; ${conflictRing}" data-id="${c.id}" data-day="${day.key}">
          <span class="termchin-card-title">${notesDot}🐾 ${c.text}</span>
          <span class="termchin-card-time">${decimalToTimeString(start)} - ${decimalToTimeString(end)}</span>
        </div>
      `;
    });
    html += `</div>`;
  });

  html += `</div></div>`;
  matrixBoard.innerHTML = html;
  initTermchinDragAndClick();
}

function initTermchinDragAndClick() {
  const rows = document.querySelectorAll('.termchin-day-row');

  rows.forEach(row => {
    let isDragging = false;
    let startDecHour = 0;
    let ghost = null;
    let pill = null;

    function getDecHourFromClientX(clientX) {
      const rect = row.getBoundingClientRect();
      const clickX = currentLang === 'fa' ? (rect.right - clientX) : (clientX - rect.left);
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const exactHour = TC_MIN_HOUR + (ratio * TC_TOTAL_HOURS);
      return Math.round(exactHour * 4) / 4;
    }

    function onDragStart(clientX) {
      isDragging = true;
      startDecHour = getDecHourFromClientX(clientX);

      ghost = document.createElement('div');
      ghost.className = 'termchin-drag-ghost';
      pill = document.createElement('div');
      pill.className = 'termchin-drag-handle-pill';
      pill.innerHTML = `+ ${decimalToTimeString(startDecHour)}`;
      ghost.appendChild(pill);
      row.appendChild(ghost);
      updateGhost(startDecHour, startDecHour + 0.25);
    }

    function updateGhost(s, e) {
      if (!ghost || !pill) return;
      const realStart = Math.max(TC_MIN_HOUR, Math.min(s, e));
      const realEnd = Math.min(TC_MAX_HOUR, Math.max(s, e));
      const posProp = currentLang === 'fa' ? 'right' : 'left';
      ghost.style[posProp] = `${((realStart - TC_MIN_HOUR) / TC_TOTAL_HOURS) * 100}%`;
      ghost.style.width = `${Math.max(1.5, ((realEnd - realStart) / TC_TOTAL_HOURS) * 100)}%`;

      const dayKey = row.getAttribute('data-day');
      const activeTasks = getActivePlanTasks();
      const list = activeTasks[dayKey] || [];
      const conflict = list.find(c => {
        const cs = c.start || c.hour;
        const ce = c.end || (cs + 1.5);
        return realStart < ce && realEnd > cs;
      });

      if (conflict) {
        ghost.classList.add('has-conflict');
        pill.innerHTML = `⚠️ ${conflict.text} (${decimalToTimeString(realStart)} - ${decimalToTimeString(realEnd)})`;
      } else {
        ghost.classList.remove('has-conflict');
        pill.innerHTML = `+ ${decimalToTimeString(realStart)} - ${decimalToTimeString(realEnd)}`;
      }
    }

    function onDragEnd(clientX) {
      if (!isDragging) return;
      isDragging = false;
      const endDecHour = getDecHourFromClientX(clientX);
      const dayKey = row.getAttribute('data-day');

      if (ghost) {
        ghost.remove();
        ghost = null;
      }

      if (Math.abs(endDecHour - startDecHour) < 0.25) return;

      let finalStart = Math.min(startDecHour, endDecHour);
      let finalEnd = Math.max(startDecHour, endDecHour);
      if (finalEnd - finalStart < 0.5) finalEnd = finalStart + 1.5;
      if (finalEnd > TC_MAX_HOUR) finalEnd = TC_MAX_HOUR;

      if (addWeeklyModal) {
        document.getElementById('weekly-day-select').value = dayKey;
        setStudentTimePicker(finalStart, finalEnd);
        addWeeklyModal.classList.remove('hidden');
        document.getElementById('weekly-task-title').focus();
      }
    }

    row.addEventListener('mousedown', (e) => {
      if (e.target.closest('.termchin-card')) return;
      onDragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !ghost) return;
      updateGhost(startDecHour, getDecHourFromClientX(e.clientX));
    });

    window.addEventListener('mouseup', (e) => {
      if (isDragging) onDragEnd(e.clientX);
    });

    row.addEventListener('touchstart', (e) => {
      if (e.target.closest('.termchin-card')) return;
      const touch = e.touches[0];
      onDragStart(touch.clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !ghost) return;
      const touch = e.touches[0];
      updateGhost(startDecHour, getDecHourFromClientX(touch.clientX));
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (isDragging) {
        const touch = e.changedTouches[0];
        onDragEnd(touch.clientX);
      }
    });
  });

  document.querySelectorAll('.termchin-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const dayKey = card.getAttribute('data-day');
      const id = Number(card.getAttribute('data-id'));
      const activeTasks = getActivePlanTasks();
      const target = (activeTasks[dayKey] || []).find(it => it.id === id);
      if (target) openTaskDetails(target, dayKey);
    });
  });
}

if (weeklyForm) {
  weeklyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('weekly-day-select').value;
    const title = document.getElementById('weekly-task-title').value.trim();
    const statusVal = document.getElementById('weekly-status-select').value;
    const notesVal = document.getElementById('weekly-task-notes')?.value.trim() || '';
    const { startDec, endDec } = getStudentTimeDecimals();

    if (endDec <= startDec) {
      alert(currentLang === 'fa' ? 'ساعت پایان باید بعد از ساعت شروع باشد!' : 'End time must be after start time!');
      return;
    }

    const activeTasks = getActivePlanTasks();
    const dayTasks = activeTasks[day] || [];
    const conflictCourse = dayTasks.find(c => {
      const s = c.start || c.hour;
      const e = c.end || (s + 1.5);
      return startDec < e && endDec > s;
    });

    if (conflictCourse) {
      const msg = currentLang === 'fa'
        ? `⚠️ هشدار تداخل زمانی!\nاین ساعت با درس «${conflictCourse.text}» (${decimalToTimeString(conflictCourse.start)} تا ${decimalToTimeString(conflictCourse.end)}) تداخل دارد.\n\nآیا مایلید برنامه قبلی حذف و این درس جایگزین شود؟\n• تایید: جایگزینی\n• لغو: تغییر ساعت`
        : `⚠️ Time Conflict!\nThis slot conflicts with "${conflictCourse.text}" (${decimalToTimeString(conflictCourse.start)} - ${decimalToTimeString(conflictCourse.end)}).\n\nDo you want to replace it?\n• OK: Replace\n• Cancel: Edit time`;

      if (!confirm(msg)) return;

      activeTasks[day] = activeTasks[day].filter(it => it.id !== conflictCourse.id);
      dailyTasks = dailyTasks.filter(it => it.id !== conflictCourse.id && it.calId !== conflictCourse.id);
    }

    const sharedId = Date.now();
    if (!activeTasks[day]) activeTasks[day] = [];
    activeTasks[day].push({
      id: sharedId,
      text: title,
      start: startDec,
      end: endDec,
      hour: Math.floor(startDec),
      status: statusVal,
      notes: notesVal
    });

    saveActivePlanTasks(activeTasks);

    if (day === getTodayCalKey()) {
      dailyTasks.unshift({
        id: sharedId,
        calId: sharedId,
        text: title,
        start: startDec,
        end: endDec,
        hour: Math.floor(startDec),
        category: 'calendar',
        status: statusVal,
        notes: notesVal,
        completed: (statusVal === 'status-green')
      });
      try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (err) {}
      renderDailyTasks();
    }

    if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
    else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
    renderAnalyticsDashboard();
    initMultiPlanSelector();
    addWeeklyModal.classList.add('hidden');
    document.getElementById('weekly-task-title').value = '';
    if (document.getElementById('weekly-task-notes')) document.getElementById('weekly-task-notes').value = '';
    updateCatStatus(currentLang === 'fa' ? `درس «${title}» با موفقیت ثبت شد! 🐾` : `"${title}" added to schedule! 🐾`);
  });
}

if (closeWeeklyModalBtn && addWeeklyModal) closeWeeklyModalBtn.addEventListener('click', () => addWeeklyModal.classList.add('hidden'));
if (openAddWeeklyBtn && addWeeklyModal) {
  openAddWeeklyBtn.addEventListener('click', () => {
    setStudentTimePicker(9, 10.5);
    addWeeklyModal.classList.remove('hidden');
    document.getElementById('weekly-task-title').focus();
  });
}
if (addWeeklyModal) {
  addWeeklyModal.addEventListener('click', (e) => {
    if (e.target === addWeeklyModal) addWeeklyModal.classList.add('hidden');
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.fullscreen-overlay').forEach(overlay => overlay.classList.add('hidden'));
  }
});

// ==========================================
// ۱۴. نمای چک‌لیست روزانه (کانبان)
// ==========================================
function renderWeeklyBoard() {
  if (!weeklyContainer) return;

  if (currentWeeklyMode === 'kanban') {
    weeklyContainer.classList.remove('hidden');
    if (matrixBoard) matrixBoard.classList.add('hidden');
  } else {
    weeklyContainer.classList.add('hidden');
  }

  weeklyContainer.innerHTML = '';
  const days = getDaysList();
  const activeTasks = getActivePlanTasks();

  days.forEach(day => {
    const col = document.createElement('div');
    col.className = 'day-column';
    const head = document.createElement('div');
    head.className = 'day-head';
    head.textContent = day.name;
    col.appendChild(head);

    const dropzone = document.createElement('div');
    dropzone.className = 'day-tasks-dropzone';

    const tasks = activeTasks[day.key] || [];
    if (tasks.length === 0) {
      dropzone.innerHTML = `<div style="color:var(--text-muted);font-size:0.75rem;text-align:center;padding:15px;">${i18nDOM[currentLang].emptyBoard}</div>`;
    } else {
      tasks.forEach(t => {
        const item = document.createElement('div');
        item.className = `week-task-item ${t.status || 'status-white'}`;
        const timeBadge = t.start ? `⏱️ ${decimalToTimeString(t.start)} - ${decimalToTimeString(t.end || t.start + 1.5)}` : '';
        const notesMark = t.notes ? '📝 ' : '';
        item.innerHTML = `<span>${notesMark}🐾 ${t.text}</span><span style="font-size:0.7rem;opacity:0.8;">${timeBadge}</span>`;
        item.addEventListener('click', () => openTaskDetails(t, day.key));
        dropzone.appendChild(item);
      });
    }

    col.appendChild(dropzone);
    weeklyContainer.appendChild(col);
  });
}

// ==========================================
// ۱۵. ماژول برنامه پیشنهادی هوش مصنوعی
// ==========================================
const aiSuggestModal = document.getElementById('ai-suggest-modal');
const openAiSuggestBtn = document.getElementById('open-ai-suggest-btn');
const closeAiSuggestBtn = document.getElementById('close-ai-suggest-btn');
const closeAiSuggestFooterBtn = document.getElementById('ai-close-suggest-footer-btn');
const aiQuickAddRowForm = document.getElementById('ai-quick-add-row-form');
const aiSuggestedContainer = document.getElementById('ai-suggested-rows-container');
const aiAddAllBtn = document.getElementById('ai-add-all-suggested-btn');
const aiMiniMatrixPreview = document.getElementById('ai-mini-matrix-preview');
const aiPreviewSummaryBadge = document.getElementById('ai-preview-summary-badge');

function renderAiSuggestedPlan() {
  if (!aiSuggestedContainer) return;
  aiSuggestedContainer.innerHTML = '';

  const tiers = [
    { key: 'high', title: currentLang === 'fa' ? '🔥 سطح ۱: اولویت بالا (حیاتی)' : '🔥 Tier 1: High Priority (Critical)', css: 'tier-high' },
    { key: 'medium', title: currentLang === 'fa' ? '⚡ سطح ۲: اولویت متوسط (عادی)' : '⚡ Tier 2: Medium Priority (Routine)', css: 'tier-medium' },
    { key: 'low', title: currentLang === 'fa' ? '🌱 سطح ۳: اولویت پایین (مرور)' : '🌱 Tier 3: Low Priority (Review)', css: 'tier-low' }
  ];

  const days = getDaysList();

  tiers.forEach(tier => {
    const items = aiProposedPlan.filter(it => it.tier === tier.key);
    if (items.length === 0) return;

    const section = document.createElement('div');
    section.className = 'ai-priority-section';
    section.innerHTML = `<div class="ai-priority-header ${tier.css}">${tier.title} <span>${items.length} ${currentLang === 'fa' ? 'درس' : 'tasks'}</span></div>`;

    items.forEach(item => {
      const dayObj = days.find(d => d.key === item.day) || { name: item.day };
      const row = document.createElement('div');
      row.className = 'ai-plan-item-row';
      row.innerHTML = `
        <div class="ai-item-info">
          <span class="ai-item-title">🐾 ${item.title}</span>
          <div class="ai-item-meta">
            <span>📅 ${dayObj.name}</span>
            <span class="badge">⏱️ ${decimalToTimeString(item.start)} - ${decimalToTimeString(item.end)}</span>
            <span>⚡ ${item.priorityLabel}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="ai-item-action-btn ${item.added ? 'added' : ''}" data-id="${item.id}">
            ${item.added ? (currentLang === 'fa' ? '✅ اضافه شد' : '✅ Added') : (currentLang === 'fa' ? '➕ افزودن به جدول' : '➕ Add')}
          </button>
          <button type="button" class="ai-item-del-btn" data-id="${item.id}" title="حذف این سطر">
            🗑️
          </button>
        </div>
      `;

      const btn = row.querySelector('.ai-item-action-btn');
      if (!item.added) {
        btn.addEventListener('click', () => {
          addSingleAiRowToSchedule(item, btn);
        });
      }

      const delBtn = row.querySelector('.ai-item-del-btn');
      delBtn.addEventListener('click', () => {
        deleteSingleAiRow(item);
      });

      section.appendChild(row);
    });

    aiSuggestedContainer.appendChild(section);
  });

  renderAiMiniMatrixPreview();
}

function deleteSingleAiRow(item) {
  const isFa = (currentLang === 'fa');

  if (item.added) {
    const confirmScheduleDel = confirm(
      isFa 
        ? `درس «${item.title}» در جدول تقویم ثبت شده است.\nآیا مایلید از جدول برنامه هفتگی هم حذف شود؟`
        : `"${item.title}" is already scheduled.\nRemove it from your weekly calendar too?`
    );

    if (confirmScheduleDel) {
      const activeTasks = getActivePlanTasks();
      const targetDay = item.day === 'today' ? getTodayCalKey() : item.day;

      if (activeTasks[targetDay]) {
        activeTasks[targetDay] = activeTasks[targetDay].filter(c => c.id !== item.scheduleId && c.text !== item.title);
        saveActivePlanTasks(activeTasks);
      }

      dailyTasks = dailyTasks.filter(t => t.id !== item.scheduleId && t.calId !== item.scheduleId && t.text !== item.title);
      try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}

      renderDailyTasks();
      if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
      else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
      renderAnalyticsDashboard();
      initMultiPlanSelector();
    }
  }

  aiProposedPlan = aiProposedPlan.filter(it => it.id !== item.id);
  try { localStorage.setItem('focus_hub_ai_proposed_v2', JSON.stringify(aiProposedPlan)); } catch (e) {}

  renderAiSuggestedPlan();
  updateCatStatus(isFa ? `درس «${item.title}» با موفقیت حذف شد! 🗑️🐾` : `"${item.title}" deleted! 🗑️🐾`);
}

function renderAiMiniMatrixPreview() {
  if (!aiMiniMatrixPreview) return;
  aiMiniMatrixPreview.innerHTML = '';
  const days = getDaysList();

  if (aiPreviewSummaryBadge) {
    aiPreviewSummaryBadge.textContent = `${aiProposedPlan.length} ${currentLang === 'fa' ? 'درس در پیش‌نویس' : 'draft tasks'}`;
  }

  aiProposedPlan.forEach(p => {
    const dayObj = days.find(d => d.key === p.day) || { name: p.day };
    const chip = document.createElement('div');
    chip.className = 'ai-preview-slot-chip';
    chip.innerHTML = `
      <strong style="color:var(--text-main);">${p.title}</strong>
      <span style="color:var(--accent-cyan); font-family:'JetBrains Mono';">${dayObj.name} (${decimalToTimeString(p.start)} - ${decimalToTimeString(p.end)})</span>
      <span style="opacity:0.8;">[${p.priorityLabel}]</span>
    `;
    aiMiniMatrixPreview.appendChild(chip);
  });
}

function addSingleAiRowToSchedule(item, btnElement) {
  const sharedId = Date.now() + Math.floor(Math.random() * 1000);
  const targetDay = item.day === 'today' ? getTodayCalKey() : item.day;
  const activeTasks = getActivePlanTasks();

  const list = activeTasks[targetDay] || [];
  const conflict = list.find(c => {
    const s = c.start || c.hour;
    const e = c.end || (s + 1.5);
    return item.start < e && item.end > s;
  });

  if (conflict) {
    const ok = confirm(`⚠️ تداخل با درس «${conflict.text}» (${decimalToTimeString(conflict.start)} - ${decimalToTimeString(conflict.end)})!\nآیا برنامه قبلی حذف و این درس جایگزین شود؟`);
    if (!ok) return;
    activeTasks[targetDay] = activeTasks[targetDay].filter(it => it.id !== conflict.id);
    dailyTasks = dailyTasks.filter(it => it.id !== conflict.id && it.calId !== conflict.id);
  }

  if (!activeTasks[targetDay]) activeTasks[targetDay] = [];
  activeTasks[targetDay].push({
    id: sharedId,
    text: item.title,
    start: item.start,
    end: item.end,
    hour: Math.floor(item.start),
    status: 'status-white',
    notes: ''
  });
  saveActivePlanTasks(activeTasks);

  if (targetDay === getTodayCalKey()) {
    dailyTasks.unshift({
      id: sharedId,
      calId: sharedId,
      text: item.title,
      start: item.start,
      end: item.end,
      hour: Math.floor(item.start),
      category: 'study',
      status: 'status-white',
      notes: '',
      completed: false
    });
    try { localStorage.setItem('focus_hub_daily_tasks', JSON.stringify(dailyTasks)); } catch (e) {}
    renderDailyTasks();
  }

  item.added = true;
  item.scheduleId = sharedId;
  try { localStorage.setItem('focus_hub_ai_proposed_v2', JSON.stringify(aiProposedPlan)); } catch (e) {}

  if (btnElement) {
    btnElement.textContent = currentLang === 'fa' ? '✅ اضافه شد' : '✅ Added';
    btnElement.classList.add('added');
  }

  if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
  else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
  renderAnalyticsDashboard();
  initMultiPlanSelector();
  updateCatStatus(currentLang === 'fa' ? `درس «${item.title}» در چیدمان برنامه ثبت شد! 🐾` : `"${item.title}" added to schedule! 🐾`);
}

if (openAiSuggestBtn && aiSuggestModal) {
  openAiSuggestBtn.addEventListener('click', () => {
    renderAiSuggestedPlan();
    aiSuggestModal.classList.remove('hidden');
  });
}

if (closeAiSuggestBtn && aiSuggestModal) {
  closeAiSuggestBtn.addEventListener('click', () => aiSuggestModal.classList.add('hidden'));
}
if (closeAiSuggestFooterBtn && aiSuggestModal) {
  closeAiSuggestFooterBtn.addEventListener('click', () => aiSuggestModal.classList.add('hidden'));
}

if (aiQuickAddRowForm) {
  aiQuickAddRowForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('ai-input-title');
    const title = titleInput ? titleInput.value.trim() : '';
    const tier = document.getElementById('ai-input-tier').value;
    const day = document.getElementById('ai-input-day').value;
    const dur = parseFloat(document.getElementById('ai-input-duration').value);

    const sameDayItems = aiProposedPlan.filter(it => it.day === day);
    let startH = 9.0;
    if (sameDayItems.length > 0) {
      const maxEnd = Math.max(...sameDayItems.map(it => it.end));
      startH = maxEnd + 0.5;
      if (startH + dur > 23.5) startH = 8.0;
    }

    let pLabel = startH < 12 ? (currentLang === 'fa' ? 'صبح (فوری)' : 'Morning') : (startH < 18 ? (currentLang === 'fa' ? 'عصر (اوج)' : 'Afternoon') : (currentLang === 'fa' ? 'شب (آرام)' : 'Evening'));

    aiProposedPlan.push({
      id: Date.now() + Math.random(),
      title,
      day,
      start: startH,
      end: Math.min(24, startH + dur),
      tier,
      priorityLabel: pLabel,
      added: false
    });

    try { localStorage.setItem('focus_hub_ai_proposed_v2', JSON.stringify(aiProposedPlan)); } catch (err) {}
    renderAiSuggestedPlan();
    if (titleInput) titleInput.value = '';
    updateCatStatus(currentLang === 'fa' ? `درس «${title}» به لیست پیشنهادی افزوده شد! 🐾` : `Added "${title}" to draft! 🐾`);
  });
}

if (aiAddAllBtn) {
  aiAddAllBtn.addEventListener('click', () => {
    aiProposedPlan.forEach(it => {
      if (!it.added) addSingleAiRowToSchedule(it, null);
    });
    renderAiSuggestedPlan();
    alert(currentLang === 'fa' ? 'تمامی سطور برنامه پیشنهادی در چیدمان برنامه ثبت شدند! 🚀' : 'All classes added to schedule! 🚀');
  });
}

// ==========================================
// ۱۶. خانه ۳: داشبورد تحلیلی و گزارش عملکرد
// ==========================================
async function generateSmartAiReport(statsData) {
  const apiKey = localStorage.getItem('focus_hub_gemini_key') || '';
  const isOnline = navigator.onLine;

  if (apiKey && isOnline) {
    try {
      const prompt = `
        تو مسکات گربه Focus Hub به نام Catmodoro هستی. داده‌های عملکردی کاربر را تحلیل کن:
        - تمرکز: ${statsData.focusMinutes} دقیقه (${statsData.pomodoros} پومودورو)
        - زنجیره: ${statsData.streak} روز
        - وفاداری: ${statsData.completionRate}%
        - دروس حیاتی: ${statsData.highTierPercent}%
        - روز اوج: ${statsData.busiestDay} (${statsData.maxHours} ساعت)
        
        یک خروجی آرایه JSON با دقیقا ۳ کارت بده:
        [
          {"icon": "🔥", "title": "عنوان کوتاه", "desc": "تحلیل بار کاری و خستگی"},
          {"icon": "⚡", "title": "عنوان کوتاه", "desc": "تحلیل روزهای اوج"},
          {"icon": "🐾", "title": "توصیه کت‌مودورو", "desc": "توصیه انگیزشی و کاربردی مسکات"}
        ]
      `;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          return { source: 'gemini', cards: JSON.parse(jsonText) };
        }
      }
    } catch (e) {}
  }

  return {
    source: 'local',
    cards: runLocalHeuristicAI(statsData)
  };
}

function runLocalHeuristicAI(data) {
  const isFa = (currentLang === 'fa');
  const cards = [];

  if (data.highTierPercent > 55) {
    cards.push({
      icon: '⚠️',
      title: isFa ? 'فشار سنگین دروس حیاتی' : 'Cognitive Overload Risk',
      desc: isFa 
        ? `بیش از ${data.highTierPercent}٪ وقتت روی دروس سطح ۱ متمرکز شده است. برای جلوگیری از فرسودگی، بین پارت‌ها زمان استراحت ۱۰ دقیقه‌ای قرار بده.`
        : `Over ${data.highTierPercent}% of study time is in Tier 1. Add 10-minute restorative breaks to prevent burnout.`
    });
  } else {
    cards.push({
      icon: '⚖️',
      title: isFa ? 'توازن استاندارد انرژی و دروس' : 'Balanced Study Distribution',
      desc: isFa 
        ? `توزیع انرژی با ${data.highTierPercent}٪ دروس حیاتی کاملاً بهینه است و ریتم پایداری برای یادگیری داری.`
        : `Healthy workload distribution with ${data.highTierPercent}% critical tasks. Your focus rhythm is stable.`
    });
  }

  if (data.maxHours >= 4.5) {
    cards.push({
      icon: '📊',
      title: isFa ? `قله تراکم در ${data.busiestDay}` : `Peak Load on ${data.busiestDay}`,
      desc: isFa 
        ? `در روز ${data.busiestDay} بیش از ${data.maxHours} ساعت مطالعه متمرکز چیده شده است؛ پیشنهاد می‌شود ۱ ساعت آن به روزهای خلوت‌تر منتقل شود.`
        : `${data.busiestDay} has over ${data.maxHours} hours scheduled. Offload 1 hour to lighter days.`
    });
  } else {
    cards.push({
      icon: '⚡',
      title: isFa ? 'پیوستگی هفتگی ایده‌آل' : 'Smooth Daily Rhythm',
      desc: isFa 
        ? `سقف مطالعاتی روزانه زیر ۴ ساعت است که نشان‌دهنده توزیع یکنواخت و امکان تمرکز عمیق بدون خستگی مفرط است.`
        : `Daily load is kept under 4 hours, ensuring sharp focus without exhaustion.`
    });
  }

  if (data.completionRate >= 75) {
    cards.push({
      icon: '🐾',
      title: isFa ? 'توصیه طلایی Catmodoro' : 'Catmodoro Witty Advice',
      desc: isFa 
        ? `میو! با نرخ انجام ${data.completionRate}٪، انضباط کاریت عالیه! زنجیره ${data.streak} روزه‌ات رو نشکن و برای تسک بعدی پومودورو رو روی ۴۵ دقیقه امتحان کن.`
        : `Meow! ${data.completionRate}% task completion is great! Protect your ${data.streak}-day streak and try a 45-min Pomodoro next.`
    });
  } else {
    cards.push({
      icon: '🐾',
      title: isFa ? 'استراتژی عبور از رکود مسکات' : 'Catmodoro Recovery Tip',
      desc: isFa 
        ? `میو! عقب افتادن چند تکلیف کاملاً طبیعیه رفیق. کارهای ناتمام رو با دکمه 📌 بالای تایمر پین کن و با پارت‌های ۲۵ دقیقه‌ای تمومشون کن!`
        : `Meow! Pin unfinished tasks above the timer and tackle them with quick 25-minute Pomodoros!`
    });
  }

  return cards;
}

async function renderAnalyticsDashboard() {
  const chartContainer = document.getElementById('weekly-bar-chart-container');
  const resultsContainer = document.getElementById('weekly-analysis-results');
  const activeTasks = getActivePlanTasks();
  const days = getDaysList();

  let dayHoursMap = { sat: 0, sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
  let tierHours = { high: 0, medium: 0, low: 0 };
  let maxDayHour = 0.5;
  let busiestDayKey = 'sat';

  days.forEach(d => {
    const list = activeTasks[d.key] || [];
    list.forEach(c => {
      const dur = Math.max(0.5, (c.end || c.start + 1.5) - c.start);
      dayHoursMap[d.key] += dur;
      if (dayHoursMap[d.key] > maxDayHour) {
        maxDayHour = dayHoursMap[d.key];
        busiestDayKey = d.key;
      }

      const text = c.text || '';
      if (text.includes('ریاضی') || text.includes('فیزیک') || text.includes('پروژه') || text.includes('کنکور')) {
        tierHours.high += dur;
      } else if (text.includes('تمرین') || text.includes('تست') || text.includes('کلاس')) {
        tierHours.medium += dur;
      } else {
        tierHours.low += dur;
      }
    });
  });

  const busiestDayObj = days.find(d => d.key === busiestDayKey) || { name: 'شنبه' };

  if (chartContainer) {
    chartContainer.innerHTML = '';
    days.forEach(d => {
      const h = Math.round(dayHoursMap[d.key] * 10) / 10;
      const heightPercent = Math.max(8, (h / maxDayHour) * 100);

      const col = document.createElement('div');
      col.className = 'chart-bar-col';
      col.innerHTML = `
        <span class="chart-bar-value">${h}h</span>
        <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
        <span class="chart-bar-label">${d.name.substring(0, 3)}</span>
      `;
      chartContainer.appendChild(col);
    });
  }

  const totalTierH = Math.max(0.1, tierHours.high + tierHours.medium + tierHours.low);
  const pHigh = Math.round((tierHours.high / totalTierH) * 100);
  const pMed = Math.round((tierHours.medium / totalTierH) * 100);
  const pLow = 100 - pHigh - pMed;

  const setMeter = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = `${val}%`; };
  const setWidth = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = `${val}%`; };

  setMeter('meter-val-high', pHigh); setWidth('meter-fill-high', pHigh);
  setMeter('meter-val-medium', pMed); setWidth('meter-fill-medium', pMed);
  setMeter('meter-val-low', pLow); setWidth('meter-fill-low', pLow);

  const balanceScoreEl = document.getElementById('priority-balance-score');
  if (balanceScoreEl) {
    if (pHigh > 65) {
      balanceScoreEl.textContent = currentLang === 'fa' ? 'فشار سنگین (نیازمند استراحت)' : 'Heavy Workload (Rest Needed)';
      balanceScoreEl.style.color = 'var(--accent-red)';
    } else {
      balanceScoreEl.textContent = currentLang === 'fa' ? 'متعادل و بهینه ✨' : 'Balanced & Optimal ✨';
      balanceScoreEl.style.color = 'var(--accent-green)';
    }
  }

  const completedDaily = dailyTasks.filter(t => t.completed).length;
  const totalDaily = dailyTasks.length;
  const rate = totalDaily > 0 ? Math.round((completedDaily / totalDaily) * 100) : 100;
  const rateEl = document.getElementById('task-completion-rate-text');
  if (rateEl) rateEl.textContent = `${rate}%`;

  const report = await generateSmartAiReport({
    focusMinutes: appStats.minutes || 0,
    pomodoros: appStats.pomodoros || 0,
    streak: appStats.streak || 1,
    completionRate: rate,
    highTierPercent: pHigh,
    busiestDay: busiestDayObj.name,
    maxHours: Math.round(maxDayHour * 10) / 10
  });

  if (resultsContainer) {
    resultsContainer.innerHTML = '';

    const isFa = (currentLang === 'fa');
    let sourceTag = '';
    let updatedTimeStr = '';

    if (isFa) {
      sourceTag = report.source === 'gemini' 
        ? '⚡ پردازش ابری: Google Gemini' 
        : '🛡️ پردازش محلی: موتور هوشمند آفلاین (سازگار با اینترنت ملی)';
      updatedTimeStr = '🕒 بروزرسانی: ' + new Date().toLocaleTimeString('fa-IR');
    } else {
      sourceTag = report.source === 'gemini' 
        ? '⚡ Cloud AI Engine: Google Gemini' 
        : '🛡️ Local Smart AI (Offline / Intranet Mode)';
      updatedTimeStr = '🕒 Updated: ' + new Date().toLocaleTimeString('en-US');
    }

    const tagBanner = document.createElement('div');
    tagBanner.style.cssText = 'grid-column: 1 / -1; font-size: 0.74rem; color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; padding: 4px 8px; background: rgba(56, 189, 248, 0.08); border-radius: 8px;';
    tagBanner.innerHTML = `<span>${sourceTag}</span><span>${updatedTimeStr}</span>`;
    resultsContainer.appendChild(tagBanner);

    report.cards.forEach(card => {
      const box = document.createElement('div');
      box.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color); padding: 14px; border-radius: 14px; display: flex; gap: 12px; align-items: flex-start; transition: transform 0.2s ease;';
      box.innerHTML = `
        <span style="font-size: 1.6rem; line-height: 1;">${card.icon}</span>
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 0.88rem; color: var(--text-main); font-weight: 800;">${card.title}</h4>
          <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted); line-height: 1.5;">${card.desc}</p>
        </div>
      `;
      resultsContainer.appendChild(box);
    });
  }
}

const runAnalysisBtn = document.getElementById('run-weekly-analysis-btn');
if (runAnalysisBtn) {
  runAnalysisBtn.addEventListener('click', async () => {
    const resultsContainer = document.getElementById('weekly-analysis-results');
    
    runAnalysisBtn.disabled = true;
    runAnalysisBtn.style.opacity = '0.7';
    const oldText = runAnalysisBtn.innerHTML;
    runAnalysisBtn.innerHTML = '<span>⏳ در حال پردازش هوشمند...</span>';

    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-primary); border: 1.5px dashed var(--accent-cyan); padding: 22px; border-radius: 16px; text-align: center; box-shadow: 0 0 25px var(--accent-glow);">
          <div style="font-size: 2.2rem; animation: catFloat 1.2s infinite ease-in-out;">🐱</div>
          <h4 style="margin: 8px 0 4px; color: var(--accent-cyan); font-size: 0.95rem;">مسکات Catmodoro در حال ارزیابی هوشمند کارنامه شماست...</h4>
          <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted);">آنالیز دقایق تمرکز، توزیع بار کاری و ریتم پومودورو</p>
        </div>
      `;
    }

    await new Promise(r => setTimeout(r, 650));
    await renderAnalyticsDashboard();

    runAnalysisBtn.disabled = false;
    runAnalysisBtn.innerHTML = oldText;
    runAnalysisBtn.style.opacity = '1';
    updateCatStatus(currentLang === 'fa' ? 'گزارش تحلیلی هوشمند با موفقیت تولید شد! 🧠🐾' : 'Smart analysis report ready! 🧠🐾');
  });
}

// ==========================================
// ۱۷. خانه ۴: کتابخانه منابع شخصی
// ==========================================
const defaultLibraryData = {
  notes: [],
  courses: [],
  websites: [],
  suggested: [
    { id: 1, title: 'ترم‌چین (برنامه‌ریزی و چیدمان انتخاب واحد)', url: 'https://termchin.vercel.app' },
    { id: 2, title: 'چت جی‌پی‌تی (ChatGPT)', url: 'https://chatgpt.com' },
    { id: 3, title: 'جمینای (Google Gemini)', url: 'https://gemini.google.com' },
    { id: 4, title: 'کلود (Claude AI)', url: 'https://claude.ai' },
    { id: 5, title: 'نوت‌بوک ال‌ام (NotebookLM)', url: 'https://notebooklm.google.com' },
    { id: 6, title: 'گوگل اسکولار (سرچ مقالات علمی جهان)', url: 'https://scholar.google.com' },
    { id: 7, title: 'سیویلیکا (پایگاه مقالات و همایش‌های ایران)', url: 'https://civilica.com' },
    { id: 8, title: 'متمم (مهارت‌های فردی و تفکر سیستمی)', url: 'https://motamem.org' },
    { id: 9, title: 'مکتب‌خونه (دوره‌های دانشگاهی شریف و تهران)', url: 'https://maktabkhooneh.org' },
    { id: 10, title: 'آلاء (آموزش‌های ویدیویی درسی و کنکور)', url: 'https://alaatv.com' },
    { id: 11, title: 'فرادرس (آموزش علوم مهندسی و نرم‌افزار)', url: 'https://faradars.org' },
    { id: 12, title: 'خان آکادمی (یادگیری مفهومی ریاضی و فیزیک)', url: 'https://khanacademy.org' },
    { id: 13, title: 'ولفرام آلفا (حل تشریحی معادلات ریاضی)', url: 'https://www.wolframalpha.com' },
    { id: 14, title: 'کوئرا (مرجع آموزش و تمرین برنامه‌نویسی)', url: 'https://quera.org' }
  ]
};

let userLibrary = safeGet('focus_hub_library_v4', defaultLibraryData);

function renderLibrary() {
  ['notes', 'courses', 'websites', 'suggested'].forEach(cat => {
    const listEl = document.getElementById(`lib-${cat}-list`);
    if (!listEl) return;
    listEl.innerHTML = '';
    const items = userLibrary[cat] || [];
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'library-item';
      li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg-secondary);border-radius:10px;border:1px solid var(--border-color);margin-bottom:6px;';
      li.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:var(--text-main);text-decoration:none;font-size:0.85rem;">🔗 ${item.title}</a><button type="button" class="del-lib-btn" data-cat="${cat}" data-id="${item.id}" style="background:none;border:none;color:var(--accent-red);cursor:pointer;">✕</button>`;
      listEl.appendChild(li);
    });
  });

  document.querySelectorAll('.del-lib-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.getAttribute('data-cat');
      const id = Number(e.currentTarget.getAttribute('data-id'));
      userLibrary[cat] = userLibrary[cat].filter(item => item.id !== id);
      try { localStorage.setItem('focus_hub_library_v4', JSON.stringify(userLibrary)); } catch (err) {}
      renderLibrary();
    });
  });
}

const addLibModal = document.getElementById('add-library-modal');
const openAddLibBtn = document.getElementById('open-add-library-btn');
const closeAddLibBtn = document.getElementById('close-library-modal-btn');
const libForm = document.getElementById('library-item-form');
const libCatSelect = document.getElementById('lib-category-select');
const libTitleInput = document.getElementById('lib-title');
const libUrlInput = document.getElementById('lib-url');

if (openAddLibBtn && addLibModal) {
  openAddLibBtn.addEventListener('click', () => {
    addLibModal.classList.remove('hidden');
    if (libTitleInput) libTitleInput.focus();
  });
}

if (closeAddLibBtn && addLibModal) {
  closeAddLibBtn.addEventListener('click', () => addLibModal.classList.add('hidden'));
}

if (addLibModal) {
  addLibModal.addEventListener('click', (e) => {
    if (e.target === addLibModal) addLibModal.classList.add('hidden');
  });
}

if (libForm) {
  libForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = libCatSelect.value;
    let url = libUrlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newItem = {
      id: Date.now(),
      title: libTitleInput.value.trim(),
      url: url
    };

    if (!userLibrary[cat]) userLibrary[cat] = [];
    userLibrary[cat].unshift(newItem);

    try { localStorage.setItem('focus_hub_library_v4', JSON.stringify(userLibrary)); } catch (err) {}
    renderLibrary();
    addLibModal.classList.add('hidden');
    libTitleInput.value = '';
    libUrlInput.value = '';
    updateCatStatus(currentLang === 'fa' ? `منبع «${newItem.title}» به قفسه اضافه شد! 📚🐾` : `"${newItem.title}" added to library! 📚🐾`);
  });
}

// ==========================================
// ۱۸. رندرهای آغازین اجرای کامل برنامه
// ==========================================
updateTimePickerOptions();
if (currentWeeklyMode === 'timeline') renderTermchinMatrix();
else if (currentWeeklyMode === 'kanban') renderWeeklyBoard();
renderLibrary();
renderAnalyticsDashboard();