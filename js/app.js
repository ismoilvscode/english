// ============================================================
// APP VERSION
// ============================================================
const APP_VERSION = 11;

// ============================================================
// 📚 LESSONS — МАЪЛУМОТИ ДОХИЛӢ (ҳамеша кор мекунад!)
// ============================================================
const LESSONS_DATA = [
  { id: 1,   title: 'Луғат 1: Асосҳо',     level: 'Ибтидоӣ',        free: true,  wordsCount: 8 },
  { id: 2,   title: 'Луғат 2: Асосҳо',     level: 'Ибтидоӣ',        free: true,  wordsCount: 10 },
  { id: 3,   title: 'Луғат 3: Асосҳо',     level: 'Ибтидоӣ',        free: true,  wordsCount: 12 },
  { id: 4,   title: 'Луғат 4: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 18 },
  { id: 5,   title: 'Луғат 5: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 18 },
  { id: 6,   title: 'Луғат 6: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 20 },
  { id: 7,   title: 'Луғат 7: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 22 },
  { id: 8,   title: 'Луғат 8: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 24 },
  { id: 9,   title: 'Луғат 9: Асосҳо',     level: 'Ибтидоӣ',        free: false, wordsCount: 26 },
  { id: 10,  title: 'Луғат ва ибораҳо 10', level: 'Ибтидоӣ',        free: false, wordsCount: 28 },
  { id: 11,  title: 'Луғат ва ибораҳо 11', level: 'Ибтидоӣ',        free: false, wordsCount: 30 },
  { id: 12,  title: 'Луғат ва ибораҳо 12', level: 'Ибтидоӣ',        free: false, wordsCount: 32 },
  { id: 13,  title: 'Луғат ва ибораҳо 13', level: 'Ибтидоӣ',        free: false, wordsCount: 34 },
  { id: 14,  title: 'Луғат ва ибораҳо 14', level: 'Ибтидоӣ',        free: false, wordsCount: 36 },
  { id: 15,  title: 'Луғат ва ибораҳо 15', level: 'Ибтидоӣ',        free: false, wordsCount: 38 },
  { id: 16,  title: 'Луғат ва ибораҳо 16', level: 'Ибтидоӣ',        free: false, wordsCount: 40 },
  { id: 17,  title: 'Луғат ва ибораҳо 17', level: 'Ибтидоӣ',        free: false, wordsCount: 42 },
  { id: 18,  title: 'Луғат ва ибораҳо 18', level: 'Ибтидоӣ',        free: false, wordsCount: 44 },
  { id: 19,  title: 'Луғат ва ибораҳо 19', level: 'Ибтидоӣ',        free: false, wordsCount: 46 },
  { id: 20,  title: 'Луғат ва ибораҳо 20', level: 'Ибтидоӣ',        free: false, wordsCount: 48 },
  { id: 21,  title: 'Матн ва машқҳо 21',   level: 'Миёна',          free: false, wordsCount: 20 },
  { id: 22,  title: 'Матн ва машқҳо 22',   level: 'Миёна',          free: false, wordsCount: 20 },
  { id: 23,  title: 'Матн ва машқҳо 23',   level: 'Миёна',          free: false, wordsCount: 21 },
  { id: 24,  title: 'Матн ва машқҳо 24',   level: 'Миёна',          free: false, wordsCount: 21 },
  { id: 25,  title: 'Матн ва машқҳо 25',   level: 'Миёна',          free: false, wordsCount: 22 },
  { id: 26,  title: 'Матн ва машқҳо 26',   level: 'Миёна',          free: false, wordsCount: 22 },
  { id: 27,  title: 'Матн ва машқҳо 27',   level: 'Миёна',          free: false, wordsCount: 23 },
  { id: 28,  title: 'Матн ва машқҳо 28',   level: 'Миёна',          free: false, wordsCount: 23 },
  { id: 29,  title: 'Матн ва машқҳо 29',   level: 'Миёна',          free: false, wordsCount: 24 },
  { id: 30,  title: 'Матн ва машқҳо 30',   level: 'Миёна',          free: false, wordsCount: 24 },
  { id: 31,  title: 'Матн ва машқҳо 31',   level: 'Миёна',          free: false, wordsCount: 25 },
  { id: 32,  title: 'Матн ва машқҳо 32',   level: 'Миёна',          free: false, wordsCount: 25 },
  { id: 33,  title: 'Матн ва машқҳо 33',   level: 'Миёна',          free: false, wordsCount: 26 },
  { id: 34,  title: 'Матн ва машқҳо 34',   level: 'Миёна',          free: false, wordsCount: 26 },
  { id: 35,  title: 'Матн ва машқҳо 35',   level: 'Миёна',          free: false, wordsCount: 27 },
  { id: 36,  title: 'Матн ва машқҳо 36',   level: 'Миёна',          free: false, wordsCount: 27 },
  { id: 37,  title: 'Матн ва машқҳо 37',   level: 'Миёна',          free: false, wordsCount: 28 },
  { id: 38,  title: 'Матн ва машқҳо 38',   level: 'Миёна',          free: false, wordsCount: 28 },
  { id: 39,  title: 'Матн ва машқҳо 39',   level: 'Миёна',          free: false, wordsCount: 29 },
  { id: 40,  title: 'Матн ва машқҳо 40',   level: 'Миёна',          free: false, wordsCount: 29 },
  { id: 41,  title: 'Матн ва машқҳо 41',   level: 'Миёна',          free: false, wordsCount: 30 },
  { id: 42,  title: 'Матн ва машқҳо 42',   level: 'Миёна',          free: false, wordsCount: 30 },
  { id: 43,  title: 'Матн ва машқҳо 43',   level: 'Миёна',          free: false, wordsCount: 31 },
  { id: 44,  title: 'Матн ва машқҳо 44',   level: 'Миёна',          free: false, wordsCount: 31 },
  { id: 45,  title: 'Матн ва машқҳо 45',   level: 'Миёна',          free: false, wordsCount: 32 },
  { id: 46,  title: 'Матн ва машқҳо 46',   level: 'Миёна',          free: false, wordsCount: 32 },
  { id: 47,  title: 'Матн ва машқҳо 47',   level: 'Миёна',          free: false, wordsCount: 33 },
  { id: 48,  title: 'Матн ва машқҳо 48',   level: 'Миёна',          free: false, wordsCount: 33 },
  { id: 49,  title: 'Матн ва машқҳо 49',   level: 'Миёна',          free: false, wordsCount: 34 },
  { id: 50,  title: 'Матн ва машқҳо 50',   level: 'Миёна',          free: false, wordsCount: 34 },
  { id: 51,  title: 'Муоширати воқеӣ 51',  level: 'Пешрафта',       free: false, wordsCount: 25 },
  { id: 52,  title: 'Муоширати воқеӣ 52',  level: 'Пешрафта',       free: false, wordsCount: 25 },
  { id: 53,  title: 'Муоширати воқеӣ 53',  level: 'Пешрафта',       free: false, wordsCount: 25 },
  { id: 54,  title: 'Муоширати воқеӣ 54',  level: 'Пешрафта',       free: false, wordsCount: 26 },
  { id: 55,  title: 'Муоширати воқеӣ 55',  level: 'Пешрафта',       free: false, wordsCount: 26 },
  { id: 56,  title: 'Муоширати воқеӣ 56',  level: 'Пешрафта',       free: false, wordsCount: 26 },
  { id: 57,  title: 'Муоширати воқеӣ 57',  level: 'Пешрафта',       free: false, wordsCount: 27 },
  { id: 58,  title: 'Муоширати воқеӣ 58',  level: 'Пешрафта',       free: false, wordsCount: 27 },
  { id: 59,  title: 'Муоширати воқеӣ 59',  level: 'Пешрафта',       free: false, wordsCount: 27 },
  { id: 60,  title: 'Муоширати воқеӣ 60',  level: 'Пешрафта',       free: false, wordsCount: 28 },
  { id: 61,  title: 'Муоширати воқеӣ 61',  level: 'Пешрафта',       free: false, wordsCount: 28 },
  { id: 62,  title: 'Муоширати воқеӣ 62',  level: 'Пешрафта',       free: false, wordsCount: 28 },
  { id: 63,  title: 'Муоширати воқеӣ 63',  level: 'Пешрафта',       free: false, wordsCount: 29 },
  { id: 64,  title: 'Муоширати воқеӣ 64',  level: 'Пешрафта',       free: false, wordsCount: 29 },
  { id: 65,  title: 'Муоширати воқеӣ 65',  level: 'Пешрафта',       free: false, wordsCount: 29 },
  { id: 66,  title: 'Муоширати воқеӣ 66',  level: 'Пешрафта',       free: false, wordsCount: 30 },
  { id: 67,  title: 'Муоширати воқеӣ 67',  level: 'Пешрафта',       free: false, wordsCount: 30 },
  { id: 68,  title: 'Муоширати воқеӣ 68',  level: 'Пешрафта',       free: false, wordsCount: 30 },
  { id: 69,  title: 'Муоширати воқеӣ 69',  level: 'Пешрафта',       free: false, wordsCount: 31 },
  { id: 70,  title: 'Муоширати воқеӣ 70',  level: 'Пешрафта',       free: false, wordsCount: 31 },
  { id: 71,  title: 'Муоширати воқеӣ 71',  level: 'Пешрафта',       free: false, wordsCount: 31 },
  { id: 72,  title: 'Муоширати воқеӣ 72',  level: 'Пешрафта',       free: false, wordsCount: 32 },
  { id: 73,  title: 'Муоширати воқеӣ 73',  level: 'Пешрафта',       free: false, wordsCount: 32 },
  { id: 74,  title: 'Муоширати воқеӣ 74',  level: 'Пешрафта',       free: false, wordsCount: 32 },
  { id: 75,  title: 'Муоширати воқеӣ 75',  level: 'Пешрафта',       free: false, wordsCount: 33 },
  { id: 76,  title: 'Муоширати воқеӣ 76',  level: 'Пешрафта',       free: false, wordsCount: 33 },
  { id: 77,  title: 'Муоширати воқеӣ 77',  level: 'Пешрафта',       free: false, wordsCount: 33 },
  { id: 78,  title: 'Муоширати воқеӣ 78',  level: 'Пешрафта',       free: false, wordsCount: 34 },
  { id: 79,  title: 'Муоширати воқеӣ 79',  level: 'Пешрафта',       free: false, wordsCount: 34 },
  { id: 80,  title: 'Муоширати воқеӣ 80',  level: 'Пешрафта',       free: false, wordsCount: 34 },
  { id: 81,  title: 'Муоширати воқеӣ 81',  level: 'Пешрафта',       free: false, wordsCount: 35 },
  { id: 82,  title: 'Муоширати воқеӣ 82',  level: 'Пешрафта',       free: false, wordsCount: 35 },
  { id: 83,  title: 'Муоширати воқеӣ 83',  level: 'Пешрафта',       free: false, wordsCount: 35 },
  { id: 84,  title: 'Муоширати воқеӣ 84',  level: 'Пешрафта',       free: false, wordsCount: 36 },
  { id: 85,  title: 'Муоширати воқеӣ 85',  level: 'Пешрафта',       free: false, wordsCount: 36 },
  { id: 86,  title: 'Муоширати воқеӣ 86',  level: 'Пешрафта',       free: false, wordsCount: 36 },
  { id: 87,  title: 'Муоширати воқеӣ 87',  level: 'Пешрафта',       free: false, wordsCount: 37 },
  { id: 88,  title: 'Муоширати воқеӣ 88',  level: 'Пешрафта',       free: false, wordsCount: 37 },
  { id: 89,  title: 'Муоширати воқеӣ 89',  level: 'Пешрафта',       free: false, wordsCount: 37 },
  { id: 90,  title: 'Муоширати воқеӣ 90',  level: 'Пешрафта',       free: false, wordsCount: 38 },
  { id: 91,  title: 'Муоширати воқеӣ 91',  level: 'Пешрафта',       free: false, wordsCount: 38 },
  { id: 92,  title: 'Муоширати воқеӣ 92',  level: 'Пешрафта',       free: false, wordsCount: 38 },
  { id: 93,  title: 'Муоширати воқеӣ 93',  level: 'Пешрафта',       free: false, wordsCount: 39 },
  { id: 94,  title: 'Муоширати воқеӣ 94',  level: 'Пешрафта',       free: false, wordsCount: 39 },
  { id: 95,  title: 'Муоширати воқеӣ 95',  level: 'Пешрафта',       free: false, wordsCount: 39 },
  { id: 96,  title: 'Муоширати воқеӣ 96',  level: 'Пешрафта',       free: false, wordsCount: 40 },
  { id: 97,  title: 'Муоширати воқеӣ 97',  level: 'Пешрафта',       free: false, wordsCount: 40 },
  { id: 98,  title: 'Муоширати воқеӣ 98',  level: 'Пешрафта',       free: false, wordsCount: 40 },
  { id: 99,  title: 'Муоширати воқеӣ 99',  level: 'Пешрафта',       free: false, wordsCount: 41 },
  { id: 100, title: 'Муоширати воқеӣ 100', level: 'Пешрафта',       free: false, wordsCount: 41 },
  { id: 101, title: 'Street Slang 101',     level: 'Street English', free: false, wordsCount: 41 },
  { id: 102, title: 'Street Slang 102',     level: 'Street English', free: false, wordsCount: 42 },
  { id: 103, title: 'Street Slang 103',     level: 'Street English', free: false, wordsCount: 42 },
  { id: 104, title: 'Street Slang 104',     level: 'Street English', free: false, wordsCount: 42 },
  { id: 105, title: 'Street Slang 105',     level: 'Street English', free: false, wordsCount: 43 },
  { id: 106, title: 'Street Slang 106',     level: 'Street English', free: false, wordsCount: 43 },
  { id: 107, title: 'Street Slang 107',     level: 'Street English', free: false, wordsCount: 43 },
  { id: 108, title: 'Street Slang 108',     level: 'Street English', free: false, wordsCount: 44 },
  { id: 109, title: 'Street Slang 109',     level: 'Street English', free: false, wordsCount: 44 },
  { id: 110, title: 'Street Slang 110',     level: 'Street English', free: false, wordsCount: 44 },
  { id: 111, title: 'Street Slang 111',     level: 'Street English', free: false, wordsCount: 45 },
  { id: 112, title: 'Street Slang 112',     level: 'Street English', free: false, wordsCount: 45 },
  { id: 113, title: 'Street Slang 113',     level: 'Street English', free: false, wordsCount: 45 },
  { id: 114, title: 'Street Slang 114',     level: 'Street English', free: false, wordsCount: 46 },
  { id: 115, title: 'Street Slang 115',     level: 'Street English', free: false, wordsCount: 46 },
  { id: 116, title: 'Street Slang 116',     level: 'Street English', free: false, wordsCount: 46 },
  { id: 117, title: 'Street Slang 117',     level: 'Street English', free: false, wordsCount: 47 },
  { id: 118, title: 'Street Slang 118',     level: 'Street English', free: false, wordsCount: 47 },
  { id: 119, title: 'Street Slang 119',     level: 'Street English', free: false, wordsCount: 47 },
  { id: 120, title: 'Street Slang 120',     level: 'Street English', free: false, wordsCount: 48 }
];

let LESSONS = LESSONS_DATA.slice();

// ============================================================
// TELEGRAM
// ============================================================
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');
}

const ADMIN_ID = 8406121228;
const user = tg?.initDataUnsafe?.user || { id: 0, first_name: 'Корбар', username: null };
const IS_ADMIN = Number(user.id) === ADMIN_ID;

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  CARD_NUMBER: '+992933217883',
  ADMIN_BOT: 'ismoilvscode',
  ADMIN_USERNAME: 'ismoilovcode',
  IMGBB_API_KEY: '5eb0b758759864c6b422ff1d11b034b5'
};

// ============================================================
// STORE
// ============================================================
const store = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k)
};

// ============================================================
// STATE
// ============================================================
let progress = store.get('progress', { completedLessons: [], testScores: {}, streak: 0 });
let premium = store.get('premium', { active: false, plan: null, startedAt: null, expiresAt: null });
let savedLessons = store.get('savedLessons', []);
let settings = store.get('settings', { dark: true, sound: true });
let allUsers = store.get('allUsers', {});
let premiumUnlockedLessons = store.get('premiumUnlockedLessons', []);

const PREMIUM_PLANS = {
  '1day':   { label: '1 рӯз',   price: 4,    days: 1 },
  '1week':  { label: '1 ҳафта', price: 25,   days: 7 },
  '1month': { label: '1 моҳ',   price: 100,  days: 30 },
  '1year':  { label: '1 сол',   price: 1199, days: 365 }
};

// ============================================================
// PREMIUM
// ============================================================
function isPremiumActive() {
  return premium.active && Date.now() < (premium.expiresAt || 0);
}

function formatPremiumCountdown(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = n => String(n).padStart(2, '0');
  return d > 0 ? `${d}р ${p(h)}:${p(m)}:${p(sec)}` : `${p(h)}:${p(m)}:${p(sec)}`;
}

function updatePremiumTimerUI() {
  const box = document.getElementById('premiumTimer');
  const txt = document.getElementById('premiumTimerText');
  if (!box || !txt) return;
  if (isPremiumActive()) {
    box.style.display = 'inline-flex';
    txt.textContent = formatPremiumCountdown((premium.expiresAt || 0) - Date.now());
  } else {
    box.style.display = 'none';
  }
}

setInterval(updatePremiumTimerUI, 1000);

// ============================================================
// UNLOCK
// ============================================================
function isLessonUnlocked(id) {
  if (id === 1) return true;
  return progress.completedLessons.includes(id - 1);
}

function isPremiumUnlockedLesson(id) {
  return premiumUnlockedLessons.includes(id);
}

function markPremiumUnlocked(id) {
  if (!premiumUnlockedLessons.includes(id)) {
    premiumUnlockedLessons.push(id);
    store.set('premiumUnlockedLessons', premiumUnlockedLessons);
  }
}

// ============================================================
// APPLY PREMIUM
// ============================================================
function applyPremiumData(data, showPopup) {
  if (!data) return;
  const wasActive = isPremiumActive();

  if (data.isPremium && data.premiumExpiresAt && Date.now() < data.premiumExpiresAt) {
    premium = {
      active: true,
      plan: data.premiumPlan,
      startedAt: data.premiumStartedAt,
      expiresAt: data.premiumExpiresAt
    };
    store.set('premium', premium);

    if (!wasActive && showPopup) {
      const key = 'premium_popup_' + data.premiumExpiresAt;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        showToast('👑 Premium фаъол шуд!');
        if (tg) {
          tg.HapticFeedback?.notificationOccurred('success');
          const days = Math.ceil((data.premiumExpiresAt - Date.now()) / 86400000);
          tg.showPopup({
            title: '🎉 Premium фаъол шуд!',
            message: `Нақша: ${data.premiumPlan || 'Premium'}\nМӯҳлат: ${days} рӯз`,
            buttons: [{ type: 'close' }]
          });
        }
      }
    }
    refreshPremiumUI();
  } else {
    if (premium.active) {
      premium = { active: false, plan: null, startedAt: null, expiresAt: null };
      store.set('premium', premium);
      refreshPremiumUI();
    }
  }
}

function refreshPremiumUI() {
  try {
    renderProfile();
    updateTestLockUI();
    renderLessons('all');
    updateStats();
    renderContinueLessons();
    syncMyUser();
  } catch (e) {}
}

// ============================================================
// PREMIUM SYNC (Firebase ихтиёрӣ)
// ============================================================
function initPremiumSync() {
  if (!user.id) return;
  if (typeof db === 'undefined' || !db) return;

  try {
    db.ref('users/' + user.id).once('value')
      .then(snap => {
        const data = snap.val();
        if (data) applyPremiumData(data, false);
      })
      .catch(() => {});
  } catch (e) {}

  if (typeof listenMyPremiumFromFirebase === 'function') {
    try {
      listenMyPremiumFromFirebase(user.id, data => applyPremiumData(data, true));
    } catch (e) {}
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function initNotificationsListener() {
  if (!user.id) return;
  if (typeof listenMyNotifications !== 'function') return;

  try {
    listenMyNotifications(user.id, notif => {
      const key = 'notif_shown_' + notif.id;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');

      if (notif.type === 'premium_rejected') {
        showToast('❌ Фармоиш рад шуд');
        if (tg) tg.showPopup({ title: '❌ Фармоиш рад шуд', message: `Сабаб: ${notif.reason || '—'}`, buttons: [{ type: 'close' }] });
      }
      if (notif.type === 'premium_revoked') {
        showToast('👑 Premium гирифта шуд');
        if (tg) {
          tg.HapticFeedback?.notificationOccurred('warning');
          tg.showPopup({ title: '👑 Premium гирифта шуд', message: 'Premium-и шумо аз ҷониби админ гирифта шуд.', buttons: [{ type: 'close' }] });
        }
      }
      if (notif.type === 'premium_approved') showToast('🎉 Premium фаъол шуд!');

      if (typeof db !== 'undefined' && db && user.id && notif.id) {
        db.ref(`notifications/${user.id}/${notif.id}`).update({ read: true }).catch(() => {});
      }
    });
  } catch (e) {}
}

// ============================================================
// ҲИСОБКУНӢ
// ============================================================
function calculateAvgScore() {
  const scores = Object.values(progress.testScores || {});
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function calculateTotalScore() {
  return progress.completedLessons.length * 10 + calculateAvgScore();
}

function syncMyUser() {
  if (!user.id) return;

  const myData = {
    id: user.id,
    name: user.first_name || 'Корбар',
    username: user.username || null,
    photo: user.photo_url || null,
    lessonsCount: progress.completedLessons.length,
    avgScore: calculateAvgScore(),
    totalScore: calculateTotalScore(),
    isPremium: isPremiumActive(),
    isAdmin: IS_ADMIN
  };

  if (typeof saveUserToFirebase === 'function') {
    try { saveUserToFirebase(myData); } catch (e) {}
  }

  allUsers[user.id] = { ...myData, lastActive: Date.now() };
  store.set('allUsers', allUsers);
}

// ============================================================
// SPLASH + INIT
// ============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash')?.classList.add('hide');
    document.getElementById('app')?.classList.remove('hidden');
    initApp();
  }, 1500);
});

async function initApp() {
  try {
    if (IS_ADMIN) {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }

    const name = user.first_name || 'Корбар';
    const userNameEl = document.getElementById('userName');
    const profileNameEl = document.getElementById('profileName');
    if (userNameEl) userNameEl.textContent = name;
    if (profileNameEl) profileNameEl.textContent = name;

    renderAvatar();
    syncMyUser();
    renderAll();

    // Firebase sync (ихтиёрӣ — агар кор кунад)
    initPremiumSync();
    initNotificationsListener();

    // Nav events
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.target));
    });

    document.querySelectorAll('.filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLessons(btn.dataset.filter);
      });
    });

    document.querySelectorAll('.rating-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rating-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderRating(btn.dataset.rating);
      });
    });

    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    initSettings();

    if (tg) tg.HapticFeedback?.impactOccurred('light');

    console.log('✅ app.js v11 — омода. LESSONS:', LESSONS.length);
  } catch (e) {
    console.error('❌ initApp error:', e);
  }
}

// ============================================================
// RENDER
// ============================================================
function renderAll() {
  updateStats();
  renderContinueLessons();
  renderLessons('all');
  renderProfile();
  renderAvatar();
  updateTestLockUI();
}

function updateStats() {
  const done = progress.completedLessons.length;
  const el = id => document.getElementById(id);

  if (el('statLessons')) el('statLessons').textContent = LESSONS.length;
  if (el('statDone')) el('statDone').textContent = done;
  if (el('statStreak')) el('statStreak').textContent = progress.streak || 0;
  if (el('pStatLessons')) el('pStatLessons').textContent = done;
  if (el('pStatWords')) el('pStatWords').textContent = progress.completedLessons.reduce((s, id) => {
    const l = LESSONS.find(x => x.id === id);
    return s + (l?.wordsCount || 0);
  }, 0);
  if (el('pStatDays')) el('pStatDays').textContent = progress.streak || 0;
}

function renderContinueLessons() {
  const container = document.getElementById('continueLessons');
  if (!container) return;

  const next = LESSONS.find(l => isLessonUnlocked(l.id) && !progress.completedLessons.includes(l.id));

  if (!next) {
    container.innerHTML = `<div class="lesson-card">
      <div class="lesson-icon"><svg class="icon"><use href="#i-award"/></svg></div>
      <div class="lesson-info"><h4>Ҳамаи дарсҳо анҷом!</h4><p>Шумо тамоми курсро гузаштед</p></div>
    </div>`;
    return;
  }
  container.innerHTML = lessonCardHTML(next);
  bindLessonClicks();
}

function renderLessons(filter = 'all') {
  const grid = document.getElementById('lessonsGrid');
  if (!grid) return;

  let list = LESSONS;
  if (filter !== 'all') {
    const map = { beginner: 'Ибтидоӣ', intermediate: 'Миёна', advanced: 'Пешрафта', street: 'Street English' };
    list = LESSONS.filter(l => l.level === map[filter]);
  }

  grid.innerHTML = list.map(l => lessonCardHTML(l)).join('');
  bindLessonClicks();
}

function lessonCardHTML(l) {
  const isDone = progress.completedLessons.includes(l.id);
  const score = progress.testScores[l.id];
  const isPremiumLocked = !l.free && !isPremiumActive() && !isPremiumUnlockedLesson(l.id);
  const isLocked = !isLessonUnlocked(l.id);

  let statusClass = '', lockIcon = '', iconName = 'i-book';

  if (isLocked) {
    statusClass = 'locked'; iconName = 'i-lock';
    lockIcon = `<div class="lock-icon"><svg class="icon"><use href="#i-lock"/></svg></div>`;
  } else if (isPremiumLocked) {
    statusClass = 'locked'; iconName = 'i-lock';
    lockIcon = `<div class="lock-icon"><svg class="icon"><use href="#i-lock"/></svg></div>`;
  } else if (isDone) {
    iconName = 'i-check-circle';
  }

  return `
    <div class="lesson-card ${statusClass} ${isDone ? 'done' : ''}" data-id="${l.id}">
      <div class="lesson-icon"><svg class="icon"><use href="#${iconName}"/></svg></div>
      <div class="lesson-info">
        <h4>${escapeHtml(l.title)} ${isPremiumLocked && !isLocked ? '<span class="badge-mini">👑</span>' : ''}</h4>
        <p>${escapeHtml(l.level)}</p>
        <div class="lesson-meta">
          <span><svg class="icon icon-xs"><use href="#i-file-text"/></svg> ${l.wordsCount} калима</span>
          ${isDone && score ? `<span class="score-tag"><svg class="icon icon-xs"><use href="#i-award"/></svg> ${score}%</span>` : ''}
          ${isLocked ? `<span style="color:#ef4444">🔒 Дарси ${l.id - 1}</span>` : ''}
        </div>
      </div>
      ${lockIcon}
    </div>`;
}

function bindLessonClicks() {
  document.querySelectorAll('.lesson-card[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const lesson = LESSONS.find(l => l.id === id);
      if (!lesson) return;

      if (!isLessonUnlocked(id)) {
        showToast(`🔒 Аввал дарси ${id - 1}-ро гузаред`);
        if (tg) tg.HapticFeedback?.notificationOccurred('error');
        return;
      }

      if (!lesson.free && !isPremiumActive() && !isPremiumUnlockedLesson(id)) {
        showToast('👑 Ин дарс барои Premium аст');
        navigateTo('premium');
        return;
      }

      if (!lesson.free && isPremiumActive()) markPremiumUnlocked(id);
      window.location.href = `lesson.html?id=${id}`;
    });
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-target="${pageName}"]`)?.classList.add('active');

  const main = document.getElementById('mainContent');
  if (main) main.scrollTop = 0;

  if (pageName === 'rating') renderRating('all');
  if (pageName === 'stats') renderStatistics();
  if (pageName === 'saved') renderSavedLessons();
  if (pageName === 'admin') renderAdmin();
  if (pageName === 'profile') updateTestLockUI();

  if (tg) tg.HapticFeedback?.selectionChanged();
}

// ============================================================
// PROFILE
// ============================================================
function renderProfile() {
  const badge = document.querySelector('.profile-badge');
  if (badge) {
    if (isPremiumActive()) {
      badge.textContent = '👑 Premium';
      badge.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
      badge.style.color = '#1e1b4b';
    } else {
      badge.textContent = 'Free версия';
      badge.style.background = '';
      badge.style.color = '';
    }
  }
  updatePremiumTimerUI();
  syncMyUser();
  updateTestLockUI();
}

// ============================================================
// AVATAR
// ============================================================
function getUserInitial() {
  const name = user.first_name || user.username || 'U';
  return name.trim().charAt(0).toUpperCase();
}

function renderAvatar() {
  const photo = user.photo_url;
  const initial = getUserInitial();

  ['headerAvatar', 'profileAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.initial = initial;

    if (photo) {
      el.innerHTML = `<img src="${photo}" alt="${escapeHtml(user.first_name || 'U')}" onerror="avatarFallback(this, '${initial}')">`;
      el.classList.add('has-photo');
    } else {
      el.innerHTML = `<span class="avatar-letter">${initial}</span>`;
      el.classList.remove('has-photo');
    }
  });
}

function avatarFallback(img, initial) {
  const parent = img.parentElement;
  if (!parent) return;
  parent.classList.remove('has-photo');
  parent.innerHTML = `<span class="avatar-letter">${initial}</span>`;
}

// ============================================================
// TEST
// ============================================================
function openTestPage() {
  if (!isPremiumActive()) {
    showToast('👑 Тестҳо танҳо барои Premium');
    if (tg) tg.HapticFeedback?.notificationOccurred('error');
    setTimeout(() => navigateTo('premium'), 700);
    return;
  }
  window.location.href = 'test.html';
}

function updateTestLockUI() {
  const active = isPremiumActive();
  const qaLabel = document.getElementById('qaTestLabel');
  const qaIcon = document.getElementById('qaTestIcon');
  if (qaLabel) qaLabel.textContent = active ? 'Тестҳо' : 'Тестҳо 🔒';
  if (qaIcon) qaIcon.style.setProperty('--c', active ? '#f59e0b' : '#64748b');
  const badge = document.getElementById('testPremiumBadge');
  if (badge) { badge.textContent = active ? '' : '👑'; badge.style.fontSize = '12px'; }
}

// ============================================================
// RATING
// ============================================================
function renderRating(filter = 'all') {
  syncMyUser();
  const podium = document.getElementById('podium');
  const container = document.getElementById('ratingList');
  const myCard = document.getElementById('myRankCard');

  if (container) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-2);font-size:13px"><div class="loader" style="margin:0 auto 16px"></div>Рейтинг бор мешавад...</div>`;
  }
  if (podium) podium.innerHTML = '';
  if (myCard) myCard.innerHTML = '';

  if (typeof listenRatingRealtime === 'function') {
    try {
      listenRatingRealtime(users => {
        const valid = (users || []).filter(u => u && u.id);
        let filtered = valid;
        if (filter === 'week') {
          const w = Date.now() - 7 * 86400000;
          filtered = valid.filter(u => (u.lastActive || 0) > w);
        } else if (filter === 'month') {
          const m = Date.now() - 30 * 86400000;
          filtered = valid.filter(u => (u.lastActive || 0) > m);
        }
        renderRatingUI(filtered);
      });
    } catch (e) {
      renderRatingUI(getLocalRatingList(filter, 100));
    }
  } else {
    renderRatingUI(getLocalRatingList(filter, 100));
  }
}

function getLocalRatingList(filter = 'all', limit = 100) {
  let users = Object.values(allUsers).filter(u => u && u.id);
  if (filter === 'week') {
    const w = Date.now() - 7 * 86400000;
    users = users.filter(u => (u.lastActive || 0) > w);
  } else if (filter === 'month') {
    const m = Date.now() - 30 * 86400000;
    users = users.filter(u => (u.lastActive || 0) > m);
  }
  users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  return users.slice(0, limit);
}

function renderRatingUI(users) {
  const podium = document.getElementById('podium');
  const container = document.getElementById('ratingList');
  const myCard = document.getElementById('myRankCard');

  if (!users || users.length === 0) {
    if (podium) podium.innerHTML = '';
    if (container) container.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg class="icon icon-2xl"><use href="#i-users"/></svg></div><h3>Ҳоло касе нест</h3><p>Аввалин шуда рейтингро сар кунед!</p></div>`;
    if (myCard) myCard.innerHTML = '';
    return;
  }

  if (podium && users.length >= 3) {
    const [f, s, t] = users;
    podium.innerHTML = `
      <div class="podium-item podium-2" onclick="showUserInfo(${s.id})">${podiumAvatar(s, '2')}<div class="podium-name">${escapeHtml(s.name || 'Корбар')}</div><div class="podium-score">${s.totalScore || 0}</div></div>
      <div class="podium-item podium-1" onclick="showUserInfo(${f.id})"><div class="podium-crown"><svg class="icon"><use href="#i-crown"/></svg></div>${podiumAvatar(f, '1')}<div class="podium-name">${escapeHtml(f.name || 'Корбар')}</div><div class="podium-score">${f.totalScore || 0}</div></div>
      <div class="podium-item podium-3" onclick="showUserInfo(${t.id})">${podiumAvatar(t, '3')}<div class="podium-name">${escapeHtml(t.name || 'Корбар')}</div><div class="podium-score">${t.totalScore || 0}</div></div>`;
  } else if (podium) podium.innerHTML = '';

  const myRank = users.findIndex(u => Number(u.id) === Number(user.id)) + 1;
  if (myCard) {
    if (myRank > 0) {
      myCard.innerHTML = `<div class="my-rank-card"><div class="my-rank-icon"><svg class="icon"><use href="#i-star"/></svg></div><div class="my-rank-info"><div class="my-rank-title">Ҷои шумо</div><div class="my-rank-value">#${myRank} аз ${users.length}</div></div><div class="my-rank-score">${calculateTotalScore()}</div></div>`;
    } else {
      myCard.innerHTML = `<div class="my-rank-card empty"><div class="my-rank-info"><div class="my-rank-title">Шумо ҳоло дар рейтинг нестед</div></div></div>`;
    }
  }

  if (!container) return;
  const startIdx = users.length >= 3 ? 3 : 0;
  const rest = users.slice(startIdx);
  if (!rest.length) { container.innerHTML = ''; return; }

  container.innerHTML = rest.map((u, i) => {
    const rank = startIdx + i + 1;
    const isMe = Number(u.id) === Number(user.id);
    return `<div class="rating-row ${isMe ? 'is-me' : ''}" onclick="showUserInfo(${u.id})">
      <div class="rating-rank">#${rank}</div>${listAvatar(u)}
      <div class="rating-info">
        <div class="rating-name">${escapeHtml(u.name || 'Корбар')} ${u.isPremium ? '👑' : ''} ${u.isAdmin ? '🛡' : ''} ${isMe ? '<span class="you-tag">Шумо</span>' : ''}</div>
        <div class="rating-stats">${u.lessonsCount || 0} дарс · ${u.avgScore || 0}%</div>
      </div>
      <div class="rating-score">${u.totalScore || 0}</div>
    </div>`;
  }).join('');
}

function podiumAvatar(u, rank) {
  const initial = getInitial(u.name);
  return `<div class="podium-avatar" data-initial="${initial}">${u.photo ? `<img src="${u.photo}" onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">` : `<span class="avatar-letter">${initial}</span>`}</div><div class="podium-rank">${rank}</div>`;
}

function listAvatar(u) {
  const initial = getInitial(u.name);
  return `<div class="rating-avatar" data-initial="${initial}">${u.photo ? `<img src="${u.photo}" onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">` : `<span class="avatar-letter">${initial}</span>`}</div>`;
}

function getInitial(name) { return (name || 'U').trim().charAt(0).toUpperCase(); }

function showUserInfo(userId) {
  if (typeof fetchUserFromFirebase === 'function') {
    try {
      fetchUserFromFirebase(userId, u => { if (u) showUserPopup(u); });
      return;
    } catch (e) {}
  }
  const u = allUsers[userId];
  if (u) showUserPopup(u);
}

function showUserPopup(u) {
  const msg = `👤 ${u.name || 'Корбар'}\n📚 ${u.lessonsCount || 0} дарс\n🎯 ${u.avgScore || 0}% миёна\n⭐ ${u.totalScore || 0} хол`;
  if (tg) tg.showPopup({ title: 'Профили корбар', message: msg, buttons: [{ type: 'close' }] });
  else alert(msg);
}

// ============================================================
// STATS
// ============================================================
function renderStatistics() {
  const total = LESSONS.length;
  const done = progress.completedLessons.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('ovTotalLessons', total);
  set('ovDone', done);
  set('ovPercent', percent + '%');
  set('progressBadge', `${done} / ${total}`);
  const pb = document.getElementById('bigProgressBar');
  if (pb) pb.style.width = percent + '%';

  const levels = { 'Ибтидоӣ': { color: '#6366f1', total: 0, done: 0 }, 'Миёна': { color: '#f59e0b', total: 0, done: 0 }, 'Пешрафта': { color: '#10b981', total: 0, done: 0 }, 'Street English': { color: '#ec4899', total: 0, done: 0 } };
  LESSONS.forEach(l => {
    if (levels[l.level]) { levels[l.level].total++; if (progress.completedLessons.includes(l.id)) levels[l.level].done++; }
  });

  const levelBox = document.getElementById('levelStats');
  if (levelBox) {
    levelBox.innerHTML = Object.entries(levels).filter(([_, v]) => v.total > 0).map(([name, v]) => {
      const pct = v.total > 0 ? Math.round((v.done / v.total) * 100) : 0;
      return `<div class="level-row"><div class="level-head"><span>${name}</span><span>${v.done} / ${v.total}</span></div><div class="level-bar"><div class="level-bar-fill" style="width: ${pct}%; background: ${v.color}"></div></div></div>`;
    }).join('');
  }

  const scores = progress.testScores || {};
  const ids = Object.keys(scores).map(Number).sort((a, b) => a - b).slice(-20);
  const chart = document.getElementById('scoreChart');
  if (chart) {
    if (!ids.length) chart.innerHTML = `<div style="width:100%;text-align:center;color:var(--text-2);font-size:13px;align-self:center">Ҳоло тест супорида нашудааст</div>`;
    else chart.innerHTML = ids.map(id => {
      const s = scores[id] || 0;
      const h = Math.max(6, (s / 100) * 100);
      return `<div class="score-bar ${s < 70 ? 'bad' : ''}" style="height: ${h}%" title="Дарси ${id}: ${s}%"></div>`;
    }).join('');
  }
}

// ============================================================
// SAVED
// ============================================================
function renderSavedLessons() {
  const c = document.getElementById('savedLessons');
  if (!c) return;
  if (!savedLessons.length) {
    c.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg class="icon icon-2xl"><use href="#i-bookmark"/></svg></div><h3>Ҳоло дарс нигоҳ дошта нашудааст</h3></div>`;
    return;
  }
  c.innerHTML = LESSONS.filter(l => savedLessons.includes(l.id)).map(l => lessonCardHTML(l)).join('');
  bindLessonClicks();
}

// ============================================================
// SETTINGS
// ============================================================
function initSettings() {
  const d = document.getElementById('settingDark');
  const s = document.getElementById('settingSound');
  if (d) {
    d.checked = settings.dark;
    d.onchange = e => {
      settings.dark = e.target.checked;
      store.set('settings', settings);
      document.body.classList.toggle('light', !settings.dark);
      const icon = document.querySelector('#themeIcon use');
      if (icon) icon.setAttribute('href', settings.dark ? '#i-moon' : '#i-sun');
    };
  }
  if (s) {
    s.checked = settings.sound;
    s.onchange = e => { settings.sound = e.target.checked; store.set('settings', settings); };
  }
}

function exportData() {
  const data = { progress, premium, savedLessons, settings, exportedAt: Date.now() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `englishpro-backup-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  showToast('Маълумот содир шуд');
}

function confirmResetAll() {
  if (!confirm('Ҳамаи маълумот нест мешавад?')) return;
  store.del('progress'); store.del('premium'); store.del('savedLessons'); store.del('settings');
  location.reload();
}

function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  settings.dark = !isLight;
  store.set('settings', settings);
  const icon = document.querySelector('#themeIcon use');
  if (icon) icon.setAttribute('href', isLight ? '#i-sun' : '#i-moon');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
}

// ============================================================
// FAQ / SUPPORT
// ============================================================
function toggleFaq(el) {
  const open = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!open) el.classList.add('open');
}

function sendSupportMessage() {
  const msg = document.getElementById('supportMessage')?.value.trim();
  if (!msg || msg.length < 5) { showToast('Паёмро нависед'); return; }
  const text = `📩 Паём аз ${user.first_name}:\n\n${msg}`;
  if (tg) tg.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
  else window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`, '_blank');
  document.getElementById('supportMessage').value = '';
  showToast('Паём фиристода шуд');
}

// ============================================================
// IMAGE
// ============================================================
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToImgBB(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const fd = new FormData();
  fd.append('key', CONFIG.IMGBB_API_KEY);
  fd.append('image', base64Data);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('ImgBB ' + res.status);
  const json = await res.json();
  if (!json.success || !json.data) throw new Error('ImgBB error');
  return json.data.display_url || json.data.url;
}

// ============================================================
// PREMIUM ORDER
// ============================================================
let currentPlanKey = null;
let selectedPhotoBase64 = null;
let uploadedPhotoUrl = null;

function openPremiumOrder(planKey) {
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) return;
  if (isPremiumActive()) { showToast('👑 Шумо аллакай Premium доред'); return; }

  currentPlanKey = planKey;
  document.getElementById('orderPlanLabel').textContent = plan.label;
  document.getElementById('orderPlanPrice').textContent = plan.price + ' сомонӣ';
  document.getElementById('cardNumberText').textContent = CONFIG.CARD_NUMBER;

  selectedPhotoBase64 = null;
  uploadedPhotoUrl = null;
  document.getElementById('photoPreview').style.display = 'flex';
  document.getElementById('photoSelected').style.display = 'none';
  document.getElementById('btnSendOrder').disabled = true;

  document.getElementById('premiumOrderModal').classList.add('open');
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
}

function closePremiumOrder() {
  document.getElementById('premiumOrderModal').classList.remove('open');
}

function copyCardNumber() {
  const text = CONFIG.CARD_NUMBER;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ Нусхабардорӣ шуд');
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    }).catch(() => fallbackCopy(text));
  } else fallbackCopy(text);
}

function fallbackCopy(text) {
  const i = document.createElement('input');
  i.value = text; i.style.position = 'fixed'; i.style.opacity = '0';
  document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove();
  showToast('✅ Нусхабардорӣ шуд');
}

async function handlePhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Танҳо сурат'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('Ҳаҷми сурат зиёд'); return; }

  const btn = document.getElementById('btnSendOrder');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Фишурдан...';

  try {
    selectedPhotoBase64 = await compressImage(file, 1200, 0.85);
    document.getElementById('photoImg').src = selectedPhotoBase64;
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoSelected').style.display = 'block';
    btn.innerHTML = 'Боркунӣ...';
    uploadedPhotoUrl = await uploadToImgBB(selectedPhotoBase64);
    btn.disabled = false;
    btn.innerHTML = orig;
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    showToast('✅ Расм омода');
  } catch (e) {
    showToast('Хато: ' + e.message);
    selectedPhotoBase64 = null;
    uploadedPhotoUrl = null;
    document.getElementById('photoPreview').style.display = 'flex';
    document.getElementById('photoSelected').style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = orig;
  }
}

function removePhoto() {
  selectedPhotoBase64 = null;
  uploadedPhotoUrl = null;
  const i = document.getElementById('paymentPhoto');
  if (i) i.value = '';
  document.getElementById('photoPreview').style.display = 'flex';
  document.getElementById('photoSelected').style.display = 'none';
  document.getElementById('btnSendOrder').disabled = true;
}

async function sendPremiumOrder() {
  if (!uploadedPhotoUrl) { showToast('Скриншот интихоб кунед'); return; }
  const plan = PREMIUM_PLANS[currentPlanKey];
  if (!plan) return;

  const btn = document.getElementById('btnSendOrder');
  btn.disabled = true;
  btn.innerHTML = 'Фиристода мешавад...';

  const order = {
    userId: user.id,
    userName: user.first_name || 'Корбар',
    userUsername: user.username || null,
    plan: currentPlanKey,
    planLabel: plan.label,
    planPrice: plan.price,
    planDays: plan.days,
    photo: uploadedPhotoUrl,
    status: 'pending',
    createdAt: Date.now()
  };

  try {
    let orderId = 'order_' + Date.now();
    if (typeof db !== 'undefined' && db) {
      const ref = db.ref('premium_orders').push();
      orderId = ref.key;
      order.orderId = orderId;
      await ref.set(order);
    } else throw new Error('Firebase нест');

    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    showSuccessPopup(order, orderId);
  } catch (e) {
    showToast('Хато: ' + e.message);
    btn.disabled = false;
    btn.innerHTML = 'Фиристодан';
  }
}

function showSuccessPopup(order, orderId) {
  closePremiumOrder();
  const botLink = `https://t.me/${CONFIG.ADMIN_BOT}?start=${orderId}`;
  const popup = document.createElement('div');
  popup.className = 'modal open';
  popup.style.zIndex = '10000';
  popup.innerHTML = `
    <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="modal-content" style="max-width:400px;text-align:center;border-radius:24px 24px 0 0">
      <div style="padding:8px 0 20px">
        <div style="font-size:70px;margin-bottom:12px">✅</div>
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">Фармоиш қабул шуд!</h2>
        <p style="color:var(--text-2);font-size:13px;margin-bottom:24px">Фармоиши шумо ба админ фиристода шуд.</p>
        <button id="btnOpenBot" style="width:100%;padding:16px;background:linear-gradient(135deg,#229ED9,#1a7ba8);color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:10px">
          Хабар ба админ дар Telegram
        </button>
        <button onclick="this.closest('.modal').remove()" style="width:100%;padding:14px;background:var(--bg-2);color:var(--text);border:1px solid var(--card-border);border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Пӯшидан</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
  document.getElementById('btnOpenBot').addEventListener('click', () => {
    if (tg?.openTelegramLink) tg.openTelegramLink(botLink);
    else window.open(botLink, '_blank');
  });
}

// ============================================================
// HELPERS
// ============================================================
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2200);
}

// ============================================================
// FIREBASE READY
// ============================================================
function onFirebaseReady() {
  console.log('🔥 Firebase пайваст шуд');
  syncMyUser();
  initPremiumSync();
  initNotificationsListener();

  if (user.id && typeof db !== 'undefined' && db) {
    db.ref('users/' + user.id).once('value').then(snap => {
      const data = snap.val();
      if (data) applyPremiumData(data, false);
    }).catch(() => {});
  }

  const rp = document.querySelector('[data-page="rating"]');
  if (rp?.classList.contains('active')) renderRating('all');
  const ap = document.querySelector('[data-page="admin"]');
  if (ap?.classList.contains('active')) renderAdmin();
}

// ============================================================
// ADMIN STATS
// ============================================================
function renderAdmin() {
  if (!IS_ADMIN) return;
  const renderList = users => {
    const valid = (users || []).filter(u => u && u.id);
    const pc = valid.filter(u => u.isPremium && u.premiumExpiresAt && Date.now() < u.premiumExpiresAt).length;
    const ac = valid.filter(u => (u.lastActive || 0) > Date.now() - 7 * 86400000).length;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('adminTotalUsers', valid.length);
    set('adminPremiumUsers', pc);
    set('adminActiveUsers', ac);
  };

  if (typeof listenAllUsersRealtime === 'function') listenAllUsersRealtime(renderList);
  else if (typeof listenRatingRealtime === 'function') listenRatingRealtime(renderList);
  else renderList(getLocalRatingList('all', 100));
}

console.log('📦 app.js v11 бор шуд — LESSONS:', LESSONS.length);
