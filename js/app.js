// ============================================================
// APP VERSION — ҳар бор ки маълумоти data/*.json-ро иваз мекунед,
// ин рақамро зиёд кунед (масалан 5, 6, 7...), то Telegram кэши
// куҳнаро истифода набарад ва файлҳои навро бор кунад.
// ============================================================
const APP_VERSION = 5;

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
const user = tg?.initDataUnsafe?.user || {
  id: 0,
  first_name: 'Корбар',
  username: null
};
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
// FORCE RESET
// ============================================================
const FORCE_RESET_VERSION = 1;
const _savedResetVersion = store.get('_forceResetVersion', 0);
if (_savedResetVersion !== FORCE_RESET_VERSION) {
  store.del('progress');
  store.set('_forceResetVersion', FORCE_RESET_VERSION);
}

let progress = store.get('progress', {
  completedLessons: [],
  testScores: {},
  streak: 0
});

let premium = store.get('premium', {
  active: false,
  plan: null,
  startedAt: null,
  expiresAt: null
});

let savedLessons = store.get('savedLessons', []);
let settings = store.get('settings', { dark: true, sound: true });
let allUsers = store.get('allUsers', {});

// Дарсҳое, ки корбар як бор дар вақти Premium будан кушодааст —
// онҳо баъд аз тамом шудани Premium низ КУШОДА мемонанд (қулф намешаванд).
let premiumUnlockedLessons = store.get('premiumUnlockedLessons', []);

// ============================================================
// PREMIUM PLANS
// ============================================================
const PREMIUM_PLANS = {
  '1day':   { label: '1 рӯз',   price: 4,    days: 1 },
  '1week':  { label: '1 ҳафта', price: 25,   days: 7 },
  '1month': { label: '1 моҳ',   price: 100,  days: 30 },
  '1year':  { label: '1 сол',   price: 1199, days: 365 }
};

// ============================================================
// 🔓 PREMIUM
// ============================================================
function isPremiumActive() {
  return premium.active && Date.now() < (premium.expiresAt || 0);
}

// ============================================================
// 🧹 ТОЗА КАРДАНИ CACHE-И PREMIUM
// ============================================================
function clearPremiumCache() {
  premium = { active: false, plan: null, startedAt: null, expiresAt: null };
  store.set('premium', premium);
  premiumUnlockedLessons = [];
  store.set('premiumUnlockedLessons', []);
  console.log('🧹 Premium cache тоза шуд');
}

function forceRefreshUI() {
  try {
    renderProfile();
    updateTestLockUI();
    renderLessons('all');
    updateStats();
    renderContinueLessons();
    updatePremiumTimerUI();
  } catch (e) {
    console.warn('forceRefreshUI error:', e);
  }
}

// ============================================================
// ⏱ ТАЙМЕРИ PREMIUM (бо сонияшумор)
// ============================================================
function formatPremiumCountdown(ms) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');
  return days > 0
    ? `${days}р ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function updatePremiumTimerUI() {
  const box = document.getElementById('premiumTimer');
  const txt = document.getElementById('premiumTimerText');
  if (!box || !txt) return;

  if (isPremiumActive()) {
    const remaining = (premium.expiresAt || 0) - Date.now();
    box.style.display = 'inline-flex';
    txt.textContent = formatPremiumCountdown(remaining);
  } else {
    box.style.display = 'none';
  }
}

setInterval(updatePremiumTimerUI, 1000);

// ============================================================
// 🧹 ТОЗА КАРДАНИ КОРБАРОНИ СОХТАГӢ
// ============================================================
function isValidTelegramId(id) {
  const n = Number(id);
  return n > 1000000;
}

function cleanupFakeUsers() {
  const users = store.get('allUsers', {});
  const cleaned = {};
  let removed = 0;

  for (const [id, u] of Object.entries(users)) {
    if (isValidTelegramId(id)) cleaned[id] = u;
    else removed++;
  }

  store.set('allUsers', cleaned);
  allUsers = cleaned;
  if (removed > 0) console.log(`🧹 ${removed} корбари сохтагӣ нест шуд`);
}

// ============================================================
// 🔓 UNLOCK — Дарсҳо пайдарпай
// ============================================================
function isLessonUnlocked(id) {
  if (id === 1) return true;
  return progress.completedLessons.includes(id - 1);
}

// ============================================================
// 👑 ДАРСҲОИ ЯКБОРА КУШОДАШУДА ДАР ВАҚТИ PREMIUM
// ============================================================
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
// 🎧 PREMIUM SYNC + AUTO CACHE CLEAR
// ============================================================
function initPremiumSync() {
  if (!user.id) return;
  if (typeof listenMyPremiumFromFirebase !== 'function') return;

  listenMyPremiumFromFirebase(user.id, data => {
    const wasActive = isPremiumActive();

    // === PREMIUM ФАЪОЛ ===
    if (data.isPremium && data.premiumExpiresAt && Date.now() < data.premiumExpiresAt) {
      premium = {
        active: true,
        plan: data.premiumPlan,
        startedAt: data.premiumStartedAt,
        expiresAt: data.premiumExpiresAt
      };
      store.set('premium', premium);

      if (!wasActive) {
        const popupKey = 'premium_popup_' + data.premiumExpiresAt;
        if (!localStorage.getItem(popupKey)) {
          localStorage.setItem(popupKey, '1');
          showToast('👑 Premium фаъол шуд!');
          if (tg) {
            tg.HapticFeedback?.notificationOccurred('success');
            const days = Math.ceil((data.premiumExpiresAt - Date.now()) / 86400000);
            tg.showPopup({
              title: '🎉 Premium фаъол шуд!',
              message: `Нақшаи шумо: ${data.premiumPlan || 'Premium'}\nМӯҳлат: ${days} рӯз`,
              buttons: [{ type: 'close' }]
            });
          }
        }
        forceRefreshUI();
      }
    }

    // === PREMIUM ХОМӮШ ШУД (аз админ ё тамом шуд) ===
    else if (!data.isPremium && premium.active) {
      clearPremiumCache();
      forceRefreshUI();
      showToast('🚫 Premium хомӯш шуд');
    }
  });
}

// ============================================================
// 🔔 NOTIFICATIONS — Premium gifted / removed / approved / rejected
// ============================================================
function initNotificationsListener() {
  if (!user.id) return;
  if (typeof listenMyNotifications !== 'function') return;

  listenMyNotifications(user.id, notif => {
    const notifKey = 'notif_shown_' + notif.id;
    if (localStorage.getItem(notifKey)) return;
    localStorage.setItem(notifKey, '1');

    // ===== PREMIUM APPROVED =====
    if (notif.type === 'premium_approved') {
      showToast('✅ Premium фаъол шуд!');
      if (tg) {
        tg.HapticFeedback?.notificationOccurred('success');
        tg.showPopup({
          title: '🎉 Premium фаъол шуд!',
          message: `Нақша: ${notif.plan || 'Premium'}\nМӯҳлат: ${notif.days} рӯз`,
          buttons: [{ type: 'close' }]
        });
      }
    }

    // ===== PREMIUM GIFTED (Тӯҳфа аз админ) =====
    if (notif.type === 'premium_gifted') {
      showToast('🎁 Шумо Premium тӯҳфа гирифтед!');
      if (tg) {
        tg.HapticFeedback?.notificationOccurred('success');
        tg.showPopup({
          title: '🎁 Premium тӯҳфа!',
          message: `Нақша: ${notif.planLabel || 'Premium'}\nМӯҳлат: ${notif.days} рӯз`,
          buttons: [{ type: 'close' }]
        });
      }
      forceRefreshUI();
    }

    // ===== PREMIUM REJECTED =====
    if (notif.type === 'premium_rejected') {
      showToast('❌ Фармоиш рад шуд');
      if (tg) {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showPopup({
          title: '❌ Фармоиш рад шуд',
          message: `Сабаб: ${notif.reason || 'Нишон дода нашуд'}`,
          buttons: [{ type: 'close' }]
        });
      }
    }

    // ===== PREMIUM REMOVED (аз админ) — CACHE ТОЗА + ҚУЛФ =====
    if (notif.type === 'premium_removed') {
      // 🧹 CACHE ТОЗА КАРДАНИ ҲАМА
      clearPremiumCache();

      showToast('🚫 Premium хомӯш карда шуд');
      if (tg) {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showPopup({
          title: '🚫 Premium хомӯш карда шуд',
          message: 'Дастрасии Premium-и шумо аз ҷониби администратор хомӯш карда шуд. Дарсҳои Premium қулф шуданд.',
          buttons: [{ type: 'close' }]
        });
      }

      forceRefreshUI();
    }

    // Mark read
    if (db && user.id && notif.id) {
      db.ref(`notifications/${user.id}/${notif.id}`).update({ read: true }).catch(() => {});
    }
  });
}

// ============================================================
// ҲИСОБКУНӢ
// ============================================================
function calculateAvgScore() {
  const scores = Object.values(progress.testScores || {});
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function calculateTotalScore() {
  return progress.completedLessons.length * 10 + calculateAvgScore();
}

// ============================================================
// SYNC КОРБАР БА FIREBASE
// ============================================================
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
    saveUserToFirebase(myData);
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
  cleanupFakeUsers();

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

  await loadManifest();
  renderAll();

  initPremiumSync();
  initNotificationsListener();

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
}

// ============================================================
// MANIFEST
// ============================================================
let LESSONS = [];

async function loadManifest() {
  try {
    const r = await fetch(`data/manifest.json?v=${APP_VERSION}`);
    const data = await r.json();
    LESSONS = data.lessons || [];
  } catch (e) {
    console.error('Manifest error:', e);
    LESSONS = [];
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
  const el = (id) => document.getElementById(id);

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

  const next = LESSONS.find(l =>
    isLessonUnlocked(l.id) && !progress.completedLessons.includes(l.id)
  );

  if (!next) {
    container.innerHTML = `<div class="lesson-card">
      <div class="lesson-icon"><svg class="icon"><use href="#i-award"/></svg></div>
      <div class="lesson-info">
        <h4>Ҳамаи дарсҳо анҷом!</h4>
        <p>Шумо тамоми курсро гузаштед</p>
      </div>
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
    const levelMap = {
      beginner: 'Ибтидоӣ',
      intermediate: 'Миёна',
      advanced: 'Пешрафта',
      street: 'Street English'
    };
    list = LESSONS.filter(l => l.level === levelMap[filter]);
  }

  grid.innerHTML = list.map(l => lessonCardHTML(l, true)).join('');
  bindLessonClicks();
}

function lessonCardHTML(l, showLevel = false) {
  const isDone = progress.completedLessons.includes(l.id);
  const score = progress.testScores[l.id];
  const isPremiumLocked = !l.free && !isPremiumActive() && !isPremiumUnlockedLesson(l.id);
  const isLocked = !isLessonUnlocked(l.id);

  let statusClass = '';
  let lockIcon = '';
  let iconName = 'i-book';

  if (isLocked) {
    statusClass = 'locked';
    iconName = 'i-lock';
    lockIcon = `<div class="lock-icon" title="Аввал дарси ${l.id - 1}-ро гузаред"><svg class="icon"><use href="#i-lock"/></svg></div>`;
  } else if (isPremiumLocked) {
    statusClass = 'locked';
    iconName = 'i-lock';
    lockIcon = `<div class="lock-icon" title="Premium лозим аст"><svg class="icon"><use href="#i-lock"/></svg></div>`;
  } else if (isDone) {
    iconName = 'i-check-circle';
  }

  return `
    <div class="lesson-card ${statusClass} ${isDone ? 'done' : ''}" data-id="${l.id}">
      <div class="lesson-icon">
        <svg class="icon"><use href="#${iconName}"/></svg>
      </div>
      <div class="lesson-info">
        <h4>
          ${escapeHtml(l.title)}
          ${isPremiumLocked && !isLocked ? ' <span class="badge-mini">👑</span>' : ''}
        </h4>
        <p>${escapeHtml(l.level)}</p>
        <div class="lesson-meta">
          <span><svg class="icon icon-xs"><use href="#i-file-text"/></svg> ${l.wordsCount} калима</span>
          ${isDone && score ? `<span class="score-tag"><svg class="icon icon-xs"><use href="#i-award"/></svg> ${score}%</span>` : ''}
          ${isLocked ? `<span style="color:#ef4444">🔒 Аввал дарси ${l.id - 1}</span>` : ''}
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

      if (!lesson.free && isPremiumActive()) {
        markPremiumUnlocked(id);
      }

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
// AVATAR (бо referrerpolicy барои суратҳои Telegram)
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
      el.innerHTML = `<img src="${photo}" referrerpolicy="no-referrer" alt="${escapeHtml(user.first_name || 'U')}" onerror="avatarFallback(this, '${initial}')">`;
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
// TEST PAGE
// ============================================================
function openTestPage() {
  if (!isPremiumActive()) {
    showToast('👑 Тестҳо танҳо барои Premium дастрасанд');
    if (tg) tg.HapticFeedback?.notificationOccurred('error');
    setTimeout(() => navigateTo('premium'), 700);
    return;
  }
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
  window.location.href = 'test.html';
}

function updateTestLockUI() {
  const active = isPremiumActive();

  const qaIcon = document.getElementById('qaTestIcon');
  const qaLabel = document.getElementById('qaTestLabel');

  if (qaLabel) qaLabel.textContent = active ? 'Тестҳо' : 'Тестҳо 🔒';
  if (qaIcon) qaIcon.style.setProperty('--c', active ? '#f59e0b' : '#64748b');

  const badge = document.getElementById('testPremiumBadge');
  if (badge) {
    badge.textContent = active ? '' : '👑';
    badge.style.fontSize = '12px';
  }
}

// ============================================================
// 🏆 RATING
// ============================================================
function renderRating(filter = 'all') {
  syncMyUser();

  const podium = document.getElementById('podium');
  const container = document.getElementById('ratingList');
  const myCard = document.getElementById('myRankCard');

  if (container) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-2);font-size:13px;">
        <div class="loader" style="margin:0 auto 16px;"></div>
        Рейтинг бор мешавад...
      </div>`;
  }
  if (podium) podium.innerHTML = '';
  if (myCard) myCard.innerHTML = '';

  if (typeof listenRatingRealtime === 'function') {
    console.log('🏆 Рейтинг аз Firebase бор мешавад...');

    try {
      listenRatingRealtime(users => {
        console.log('🏆 Firebase users:', users.length);
        const validUsers = (users || []).filter(u => u && u.id);

        let filtered = validUsers;
        if (filter === 'week') {
          const weekAgo = Date.now() - 7 * 86400000;
          filtered = validUsers.filter(u => (u.lastActive || 0) > weekAgo);
        } else if (filter === 'month') {
          const monthAgo = Date.now() - 30 * 86400000;
          filtered = validUsers.filter(u => (u.lastActive || 0) > monthAgo);
        }

        renderRatingUI(filtered);
      });
    } catch (e) {
      console.error('❌ Firebase rating error:', e);
      const list = getLocalRatingList(filter, 100);
      renderRatingUI(list);
    }
  } else {
    console.warn('⚠️ listenRatingRealtime нест — аз localStorage');
    const list = getLocalRatingList(filter, 100);
    renderRatingUI(list);
  }
}

function getLocalRatingList(filter = 'all', limit = 100) {
  let users = Object.values(allUsers).filter(u => u && u.id);

  if (filter === 'week') {
    const weekAgo = Date.now() - 7 * 86400000;
    users = users.filter(u => (u.lastActive || 0) > weekAgo);
  } else if (filter === 'month') {
    const monthAgo = Date.now() - 30 * 86400000;
    users = users.filter(u => (u.lastActive || 0) > monthAgo);
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
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg class="icon icon-2xl"><use href="#i-users"/></svg></div>
          <h3>Ҳоло касе нест</h3>
          <p>Аввалин шуда рейтингро сар кунед!</p>
        </div>`;
    }
    if (myCard) myCard.innerHTML = '';
    return;
  }

  // Топ-3
  if (podium && users.length >= 3) {
    const [first, second, third] = users;
    podium.innerHTML = `
      <div class="podium-item podium-2" onclick="showUserInfo(${second.id})">
        ${podiumAvatar(second, '2')}
        <div class="podium-name">${escapeHtml(second.name || 'Корбар')}</div>
        <div class="podium-score">${second.totalScore || 0}</div>
      </div>
      <div class="podium-item podium-1" onclick="showUserInfo(${first.id})">
        <div class="podium-crown"><svg class="icon"><use href="#i-crown"/></svg></div>
        ${podiumAvatar(first, '1')}
        <div class="podium-name">${escapeHtml(first.name || 'Корбар')}</div>
        <div class="podium-score">${first.totalScore || 0}</div>
      </div>
      <div class="podium-item podium-3" onclick="showUserInfo(${third.id})">
        ${podiumAvatar(third, '3')}
        <div class="podium-name">${escapeHtml(third.name || 'Корбар')}</div>
        <div class="podium-score">${third.totalScore || 0}</div>
      </div>
    `;
  } else if (podium) {
    podium.innerHTML = '';
  }

  // Ҷои худ
  const myRank = users.findIndex(u => Number(u.id) === Number(user.id)) + 1;
  if (myCard) {
    if (myRank > 0) {
      myCard.innerHTML = `
        <div class="my-rank-card">
          <div class="my-rank-icon"><svg class="icon"><use href="#i-star"/></svg></div>
          <div class="my-rank-info">
            <div class="my-rank-title">Ҷои шумо</div>
            <div class="my-rank-value">#${myRank} аз ${users.length}</div>
          </div>
          <div class="my-rank-score">${calculateTotalScore()}</div>
        </div>`;
    } else {
      myCard.innerHTML = `
        <div class="my-rank-card empty">
          <div class="my-rank-info">
            <div class="my-rank-title">Шумо ҳоло дар рейтинг нестед</div>
            <div class="my-rank-value">Дарс хонед ва ба рейтинг бароед!</div>
          </div>
        </div>`;
    }
  }

  if (!container) return;
  const startIdx = users.length >= 3 ? 3 : 0;
  const rest = users.slice(startIdx);

  if (rest.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = rest.map((u, idx) => {
    const rank = startIdx + idx + 1;
    const isMe = Number(u.id) === Number(user.id);
    return `
      <div class="rating-row ${isMe ? 'is-me' : ''}" onclick="showUserInfo(${u.id})">
        <div class="rating-rank">#${rank}</div>
        ${listAvatar(u)}
        <div class="rating-info">
          <div class="rating-name">
            ${escapeHtml(u.name || 'Корбар')}
            ${u.isPremium ? '<span title="Premium">👑</span>' : ''}
            ${u.isAdmin ? '<span title="Admin">🛡</span>' : ''}
            ${isMe ? '<span class="you-tag">Шумо</span>' : ''}
          </div>
          <div class="rating-stats">${u.lessonsCount || 0} дарс · ${u.avgScore || 0}%</div>
        </div>
        <div class="rating-score">${u.totalScore || 0}</div>
      </div>
    `;
  }).join('');
}

function podiumAvatar(u, rank) {
  const initial = getInitial(u.name);
  return `
    <div class="podium-avatar" data-initial="${initial}">
      ${u.photo
        ? `<img src="${u.photo}" referrerpolicy="no-referrer" alt="${escapeHtml(u.name || 'Корбар')}" onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">`
        : `<span class="avatar-letter">${initial}</span>`}
    </div>
    <div class="podium-rank">${rank}</div>
  `;
}

function listAvatar(u) {
  const initial = getInitial(u.name);
  return `
    <div class="rating-avatar" data-initial="${initial}">
      ${u.photo
        ? `<img src="${u.photo}" referrerpolicy="no-referrer" alt="${escapeHtml(u.name || 'Корбар')}" onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">`
        : `<span class="avatar-letter">${initial}</span>`}
    </div>
  `;
}

function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

function showUserInfo(userId) {
  if (typeof fetchUserFromFirebase === 'function') {
    fetchUserFromFirebase(userId, u => {
      if (!u) {
        const local = allUsers[userId];
        if (local) showUserPopup(local);
        return;
      }
      showUserPopup(u);
    });
  } else {
    const u = allUsers[userId];
    if (u) showUserPopup(u);
  }
}

function showUserPopup(u) {
  const msg = `👤 ${u.name || 'Корбар'}\n📚 ${u.lessonsCount || 0} дарс\n🎯 ${u.avgScore || 0}% миёна\n⭐ ${u.totalScore || 0} хол`;
  if (tg) {
    tg.showPopup({
      title: 'Профили корбар',
      message: msg,
      buttons: [{ type: 'close' }]
    });
  } else {
    alert(msg);
  }
}

// ============================================================
// STATISTICS
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

  const levels = {
    'Ибтидоӣ': { color: '#6366f1', total: 0, done: 0 },
    'Миёна': { color: '#f59e0b', total: 0, done: 0 },
    'Пешрафта': { color: '#10b981', total: 0, done: 0 },
    'Street English': { color: '#ec4899', total: 0, done: 0 }
  };

  LESSONS.forEach(l => {
    if (levels[l.level]) {
      levels[l.level].total++;
      if (progress.completedLessons.includes(l.id)) levels[l.level].done++;
    }
  });

  const levelBox = document.getElementById('levelStats');
  if (levelBox) {
    levelBox.innerHTML = Object.entries(levels)
      .filter(([_, v]) => v.total > 0)
      .map(([name, v]) => {
        const pct = v.total > 0 ? Math.round((v.done / v.total) * 100) : 0;
        return `
          <div class="level-row">
            <div class="level-head">
              <span>${name}</span>
              <span>${v.done} / ${v.total}</span>
            </div>
            <div class="level-bar">
              <div class="level-bar-fill" style="width: ${pct}%; background: ${v.color}"></div>
            </div>
          </div>`;
      }).join('');
  }

  const scores = progress.testScores || {};
  const scoreIds = Object.keys(scores).map(Number).sort((a, b) => a - b).slice(-20);
  const chart = document.getElementById('scoreChart');
  if (chart) {
    if (scoreIds.length === 0) {
      chart.innerHTML = `<div style="width:100%;text-align:center;color:var(--text-2);font-size:13px;align-self:center;">
        Ҳоло тест супорида нашудааст
      </div>`;
    } else {
      chart.innerHTML = scoreIds.map(id => {
        const s = scores[id] || 0;
        const h = Math.max(6, (s / 100) * 100);
        const cls = s < 70 ? 'bad' : '';
        return `<div class="score-bar ${cls}" style="height: ${h}%" title="Дарси ${id}: ${s}%"></div>`;
      }).join('');
    }
  }
}

// ============================================================
// SAVED LESSONS
// ============================================================
function renderSavedLessons() {
  const container = document.getElementById('savedLessons');
  if (!container) return;

  if (savedLessons.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon"><svg class="icon icon-2xl"><use href="#i-bookmark"/></svg></div>
      <h3>Ҳоло дарс нигоҳ дошта нашудааст</h3>
      <p>Барои нигоҳ доштан дарсҳоро кушоед</p>
    </div>`;
    return;
  }
  const saved = LESSONS.filter(l => savedLessons.includes(l.id));
  container.innerHTML = saved.map(l => lessonCardHTML(l)).join('');
  bindLessonClicks();
}

// ============================================================
// SETTINGS
// ============================================================
function initSettings() {
  const darkSwitch = document.getElementById('settingDark');
  const soundSwitch = document.getElementById('settingSound');

  if (darkSwitch) {
    darkSwitch.checked = settings.dark;
    darkSwitch.onchange = (e) => {
      settings.dark = e.target.checked;
      store.set('settings', settings);
      document.body.classList.toggle('light', !settings.dark);
      const icon = document.querySelector('#themeIcon use');
      if (icon) icon.setAttribute('href', settings.dark ? '#i-moon' : '#i-sun');
    };
  }

  if (soundSwitch) {
    soundSwitch.checked = settings.sound;
    soundSwitch.onchange = (e) => {
      settings.sound = e.target.checked;
      store.set('settings', settings);
    };
  }
}

function exportData() {
  const data = { progress, premium, savedLessons, settings, exportedAt: Date.now() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `englishpro-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Маълумот содир шуд');
}

function confirmResetAll() {
  if (!confirm('Ҳамаи маълумот нест мешавад. Мутмаин ҳастед?')) return;
  store.del('progress');
  store.del('premium');
  store.del('premiumUnlockedLessons');
  store.del('savedLessons');
  store.del('settings');
  location.reload();
}

// ============================================================
// THEME
// ============================================================
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
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

function sendSupportMessage() {
  const msg = document.getElementById('supportMessage')?.value.trim();
  if (!msg || msg.length < 5) { showToast('Паёмро нависед'); return; }
  const text = `📩 Паём аз ${user.first_name} (@${user.username || '—'}):\n\n${msg}`;
  if (tg) {
    tg.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
  } else {
    window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`, '_blank');
  }
  document.getElementById('supportMessage').value = '';
  showToast('Паём фиристода шуд');
}

// ============================================================
// IMAGE COMPRESSION
// ============================================================
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// IMGBB
// ============================================================
async function uploadToImgBB(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const formData = new FormData();
  formData.append('key', CONFIG.IMGBB_API_KEY);
  formData.append('image', base64Data);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('ImgBB upload failed: ' + res.status);

  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error?.message || 'ImgBB error');

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

  if (isPremiumActive()) {
    showToast('👑 Шумо аллакай Premium доред');
    return;
  }

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
      showToast('✅ Номер нусхабардорӣ шуд');
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
  showToast('✅ Номер нусхабардорӣ шуд');
}

async function handlePhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Танҳо сурат қабул мешавад');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('Ҳаҷми сурат аз 10 МБ зиёд аст');
    return;
  }

  const btn = document.getElementById('btnSendOrder');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<svg class="icon icon-sm"><use href="#i-refresh"/></svg> Фишурдан...';

  try {
    selectedPhotoBase64 = await compressImage(file, 1200, 0.85);

    document.getElementById('photoImg').src = selectedPhotoBase64;
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoSelected').style.display = 'block';

    btn.innerHTML = '<svg class="icon icon-sm"><use href="#i-refresh"/></svg> Боркунӣ...';

    uploadedPhotoUrl = await uploadToImgBB(selectedPhotoBase64);

    console.log('✅ Расм ба ImgBB бор шуд:', uploadedPhotoUrl);

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    showToast('✅ Расм омода аст');
  } catch (e) {
    console.error('Photo upload error:', e);
    showToast('Хато: ' + e.message);
    selectedPhotoBase64 = null;
    uploadedPhotoUrl = null;
    document.getElementById('photoPreview').style.display = 'flex';
    document.getElementById('photoSelected').style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = originalText;
  }
}

function removePhoto() {
  selectedPhotoBase64 = null;
  uploadedPhotoUrl = null;
  const input = document.getElementById('paymentPhoto');
  if (input) input.value = '';
  document.getElementById('photoPreview').style.display = 'flex';
  document.getElementById('photoSelected').style.display = 'none';
  document.getElementById('btnSendOrder').disabled = true;
}

async function sendPremiumOrder() {
  if (!uploadedPhotoUrl) {
    showToast('Скриншоти пардохтро интихоб кунед');
    return;
  }

  const plan = PREMIUM_PLANS[currentPlanKey];
  if (!plan) return;

  const btn = document.getElementById('btnSendOrder');
  btn.disabled = true;
  btn.innerHTML = '<svg class="icon icon-sm"><use href="#i-refresh"/></svg> Фиристода мешавад...';

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
      console.log('✅ Фармоиш ба Firebase фиристода шуд:', orderId);
    } else {
      throw new Error('Firebase пайваст нест');
    }

    if (tg) tg.HapticFeedback?.notificationOccurred('success');
    showSuccessPopup(order, orderId);
  } catch (e) {
    console.error('Order error:', e);
    showToast('Хато дар фиристодан: ' + e.message);
    btn.disabled = false;
    btn.innerHTML = '<svg class="icon icon-sm"><use href="#i-send"/></svg> Фиристодан';
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
        <div style="font-size:70px;margin-bottom:12px;animation:bounceIn 0.6s ease">✅</div>
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">Фармоиш қабул шуд!</h2>
        <p style="color:var(--text-2);font-size:13px;line-height:1.6;margin-bottom:24px">
          Фармоиши шумо ба админ фиристода шуд.<br>
          Баъд аз тасдиқ Premium худкор фаъол мешавад.
        </p>

        <div style="background:var(--bg-2);border-radius:14px;padding:14px;margin-bottom:20px;text-align:left;font-size:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="color:var(--text-2)">Нақша:</span>
            <strong>${escapeHtml(order.planLabel)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-2)">Маблағ:</span>
            <strong style="color:#fbbf24">${order.planPrice} сомонӣ</strong>
          </div>
        </div>

        <button id="btnOpenBot"
          style="width:100%;padding:16px;background:linear-gradient(135deg,#229ED9,#1a7ba8);color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px;box-shadow:0 8px 24px rgba(34,158,217,0.4);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
          Хабар ба админ дар Telegram
        </button>

        <button onclick="this.closest('.modal').remove()"
          style="width:100%;padding:14px;background:var(--bg-2);color:var(--text);border:1px solid var(--card-border);border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">
          Пӯшидан
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById('btnOpenBot').addEventListener('click', () => {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(botLink);
    } else {
      window.open(botLink, '_blank');
    }
  });
}

// ============================================================
// HELPERS
// ============================================================
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

// ============================================================
// FIREBASE READY
// ============================================================
function onFirebaseReady() {
  console.log('🔥 Firebase пайваст шуд');
  syncMyUser();
  initPremiumSync();
  initNotificationsListener();

  const ratingPage = document.querySelector('[data-page="rating"]');
  if (ratingPage?.classList.contains('active')) {
    renderRating('all');
  }

  const adminPage = document.querySelector('[data-page="admin"]');
  if (adminPage?.classList.contains('active')) {
    renderAdmin();
  }
}

// ============================================================
// ADMIN RENDER
// ============================================================
function renderAdmin() {
  if (!IS_ADMIN) return;

  const renderList = (users) => {
    const validUsers = users.filter(u => u && u.id);

    const premiumCount = validUsers.filter(u => u.isPremium).length;
    const activeCount = validUsers.filter(u => (u.lastActive || 0) > Date.now() - 7 * 86400000).length;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('adminTotalUsers', validUsers.length);
    set('adminPremiumUsers', premiumCount);
    set('adminActiveUsers', activeCount);
  };

  if (typeof listenRatingRealtime === 'function') {
    listenRatingRealtime(renderList);
  } else {
    renderList(getLocalRatingList('all', 100));
  }
}
