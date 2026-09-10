// ============================================
// TELEGRAM
// ============================================
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#0f172a'); tg.setBackgroundColor('#0f172a'); }

const ADMIN_ID = 8406121228;  // ← ID-и админ
const user = tg?.initDataUnsafe?.user || { id: 0, first_name: 'Корбар', username: 'user' };
const IS_ADMIN = user.id === ADMIN_ID;

// ============================================
// LOCAL STORAGE HELPERS
// ============================================
const store = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k)
};

// Омори корбар
let progress = store.get('progress', {
  completedLessons: [],        // [1, 2, 3]
  testScores: {},              // { "1": 100, "2": 80 }
  streak: 0,
  lastVisit: null
});

// Premium
let premium = store.get('premium', {
  active: false,
  plan: null,                  // '1day' | '1week' | '1month' | '1year'
  startedAt: null,
  expiresAt: null,
  paymentStatus: 'none'        // 'none' | 'pending' | 'approved'
});

// ============================================
// PREMIUM PLANS
// ============================================
const PREMIUM_PLANS = {
  '1day':   { label: '1 рӯз',   price: 4,    days: 1,   badge: null,       desc: 'Барои санҷиши Premium' },
  '1week':  { label: '1 ҳафта', price: 25,   days: 7,   badge: 'МАЪМУЛ',   desc: 'Барои омӯзиши ҳаррӯза' },
  '1month': { label: '1 моҳ',   price: 100,  days: 30,  badge: 'БЕҲТАРИН', desc: 'Барои пешрафти ҷиддӣ' },
  '1year':  { label: '1 сол',   price: 1199, days: 365, badge: 'VALUE',    desc: 'Барои омӯзиши дарозмуддат' }
};

// ============================================
// SPLASH + INIT
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }, 1500);
});

async function initApp() {
  // Ном
  const name = user.first_name || 'Корбар';
  document.getElementById('userName').textContent = name;
  document.getElementById('profileName').textContent = name;

  // Admin panel
  if (IS_ADMIN) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
  }

  // Premium expiry check
  checkPremiumExpiry();

  // Load lessons metadata
  await loadManifest();

  // Рендер
  renderAll();
  startPremiumTimer();

  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.target));
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLessons(btn.dataset.filter);
    });
  });

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  if (tg) tg.HapticFeedback?.impactOccurred('light');
}

// ============================================
// MANIFEST
// ============================================
let LESSONS = [];

async function loadManifest() {
  try {
    const r = await fetch('data/manifest.json');
    const data = await r.json();
    LESSONS = data.lessons;
  } catch (e) {
    console.error('Manifest load error:', e);
    LESSONS = [];
  }
}

// ============================================
// PREMIUM EXPIRY
// ============================================
function checkPremiumExpiry() {
  if (!premium.active) return;
  if (Date.now() >= premium.expiresAt) {
    premium.active = false;
    premium.paymentStatus = 'none';
    store.set('premium', premium);
    showToast('Муҳлати Premium тамом шуд');
  }
}

function isPremiumActive() {
  return premium.active && Date.now() < premium.expiresAt;
}

// ============================================
// LESSON UNLOCK LOGIC
// ============================================
function isLessonUnlocked(id) {
  // Дарси 1 ҳамеша кушода
  if (id === 1) return true;
  // Агар пешинааш анҷом шуда бошад
  return progress.completedLessons.includes(id - 1);
}

function isLessonCompleted(id) {
  return progress.completedLessons.includes(id);
}

function getLessonStatus(id) {
  if (isLessonCompleted(id)) return 'done';
  if (isLessonUnlocked(id)) return 'open';
  return 'locked';
}

function completeLesson(id, score) {
  if (!progress.completedLessons.includes(id)) {
    progress.completedLessons.push(id);
    progress.completedLessons.sort((a, b) => a - b);
  }
  progress.testScores[id] = Math.max(progress.testScores[id] || 0, score);
  store.set('progress', progress);

  if (tg) tg.HapticFeedback?.notificationOccurred('success');
  renderAll();

  // Огоҳии кушодашавии дарси навбатӣ
  const next = id + 1;
  if (next <= 48) {
    setTimeout(() => showToast(`🎉 Дарси ${next} кушода шуд!`), 500);
  }
}

// ============================================
// RENDER
// ============================================
function renderAll() {
  updateStats();
  renderContinueLessons();
  renderLessons(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  renderProfile();
  updatePremiumUI();
}

function updateStats() {
  const done = progress.completedLessons.length;
  document.getElementById('statLessons').textContent = LESSONS.length;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statStreak').textContent = progress.streak;
  document.getElementById('pStatLessons').textContent = done;
  document.getElementById('pStatWords').textContent = progress.completedLessons.reduce((s, id) => {
    const l = LESSONS.find(x => x.id === id);
    return s + (l?.wordsCount || 0);
  }, 0);
  document.getElementById('pStatDays').textContent = progress.streak;
}

function renderContinueLessons() {
  const container = document.getElementById('continueLessons');
  // Дарси навбатии кушода, ки ҳанӯз анҷом нашуда
  const next = LESSONS.find(l => isLessonUnlocked(l.id) && !isLessonCompleted(l.id));

  if (!next) {
    container.innerHTML = `
      <div class="lesson-card">
        <div class="lesson-icon">${icon('i-award')}</div>
        <div class="lesson-info">
          <h4>Ҳамаи дарсҳо анҷом!</h4>
          <p>Шумо тамоми курсро гузаштед 🎉</p>
        </div>
      </div>`;
    return;
  }
  container.innerHTML = lessonCardHTML(next);
  bindLessonClicks();
}

function renderLessons(filter = 'all') {
  const grid = document.getElementById('lessonsGrid');
  const list = filter === 'all' ? LESSONS : LESSONS.filter(l => {
    if (filter === 'beginner') return l.level.includes('Ибтидоӣ');
    if (filter === 'intermediate') return l.level.includes('Миёна');
    if (filter === 'advanced') return l.level.includes('Пешрафта');
    return true;
  });
  grid.innerHTML = list.map(l => lessonCardHTML(l, true)).join('');
  bindLessonClicks();
}

function lessonCardHTML(l, showLevel = false) {
  const status = getLessonStatus(l.id);
  const isLocked = status === 'locked';
  const isDone = status === 'done';
  const needPremium = !l.free && !isPremiumActive();
  const score = progress.testScores[l.id];

  let iconName = 'i-book';
  if (isDone) iconName = 'i-check-circle';
  else if (isLocked) iconName = 'i-lock';

  return `
    <div class="lesson-card ${isLocked ? 'locked' : ''} ${isDone ? 'done' : ''}" data-id="${l.id}" data-status="${status}">
      <div class="lesson-icon">${icon(iconName)}</div>
      <div class="lesson-info">
        <h4>${l.title}${needPremium ? ' <span class="badge-mini">👑</span>' : ''}</h4>
        <p>${l.level}</p>
        <div class="lesson-meta">
          <span>${icon('i-file-text', 'icon-xs')} ${l.wordsCount} калима</span>
          ${isDone && score ? `<span class="score-tag">${icon('i-award', 'icon-xs')} ${score}%</span>` : ''}
        </div>
        ${isDone ? `<div class="lesson-progress"><div class="lesson-progress-bar" style="width:100%"></div></div>` : ''}
      </div>
      ${isLocked ? `<div class="lock-icon">${icon('i-lock')}</div>` : ''}
    </div>`;
}

function bindLessonClicks() {
  document.querySelectorAll('.lesson-card[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const lesson = LESSONS.find(l => l.id === id);
      if (!lesson) return;

      if (isLessonCompleted(id)) {
        showToast('Шумо ин дарсро гузаштед ✓');
        // Метавонед аз нав кушоед
        openLesson(id);
        return;
      }
      if (!isLessonUnlocked(id)) {
        showToast(`Аввал дарси ${id - 1}-ро анҷом диҳед`);
        if (tg) tg.HapticFeedback?.notificationOccurred('error');
        return;
      }
      if (!lesson.free && !isPremiumActive()) {
        showToast('👑 Ин дарс барои Premium аст');
        navigateTo('premium');
        return;
      }
      openLesson(id);
    });
  });
}

function openLesson(id) {
  if (tg) tg.HapticFeedback?.impactOccurred('medium');
  // Кушодан дар ҳамон WebApp
  window.location.href = `lesson.html?id=${id}`;
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-target="${pageName}"]`)?.classList.add('active');
  document.getElementById('mainContent').scrollTop = 0;
  if (tg) tg.HapticFeedback?.selectionChanged();
}

// ============================================
// PROFILE + PREMIUM TIMER
// ============================================
let premiumTimerInterval = null;

function renderProfile() {
  const badge = document.querySelector('.profile-badge');
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

function updatePremiumUI() {
  const banner = document.querySelector('.premium-banner');
  if (isPremiumActive() && banner) {
    banner.style.display = 'none';
  } else if (banner) {
    banner.style.display = '';
  }

  // Timer card
  let timerCard = document.getElementById('premiumTimerCard');
  if (isPremiumActive()) {
    if (!timerCard) {
      timerCard = document.createElement('div');
      timerCard.id = 'premiumTimerCard';
      timerCard.className = 'premium-timer-card';
      const profileCard = document.querySelector('.profile-card');
      profileCard.parentNode.insertBefore(timerCard, profileCard.nextSibling);
    }
    renderPremiumTimer();
  } else if (timerCard) {
    timerCard.remove();
  }
}

function startPremiumTimer() {
  if (premiumTimerInterval) clearInterval(premiumTimerInterval);
  if (!isPremiumActive()) return;
  premiumTimerInterval = setInterval(() => {
    if (!isPremiumActive()) {
      clearInterval(premiumTimerInterval);
      checkPremiumExpiry();
      updatePremiumUI();
      renderProfile();
      return;
    }
    renderPremiumTimer();
  }, 1000);
}

function renderPremiumTimer() {
  const el = document.getElementById('premiumTimerCard');
  if (!el) return;

  const remain = premium.expiresAt - Date.now();
  if (remain <= 0) return;

  const days = Math.floor(remain / 86400000);
  const hours = Math.floor((remain % 86400000) / 3600000);
  const mins = Math.floor((remain % 3600000) / 60000);
  const secs = Math.floor((remain % 60000) / 1000);

  const plan = PREMIUM_PLANS[premium.plan];
  const expiresDate = new Date(premium.expiresAt).toLocaleString('tg-TJ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  el.innerHTML = `
    <div class="timer-header">
      <span class="crown-sm">${icon('i-crown')}</span>
      <div>
        <div class="timer-title">Premium фаъол</div>
        <div class="timer-plan">${plan?.label || ''}</div>
      </div>
    </div>
    <div class="timer-countdown">
      <div class="timer-block"><span>${days}</span><small>рӯз</small></div>
      <div class="timer-block"><span>${String(hours).padStart(2, '0')}</span><small>соат</small></div>
      <div class="timer-block"><span>${String(mins).padStart(2, '0')}</span><small>дақ</small></div>
      <div class="timer-block"><span>${String(secs).padStart(2, '0')}</span><small>сон</small></div>
    </div>
    <div class="timer-expires">Анҷом: ${expiresDate}</div>
  `;
}

// ============================================
// PREMIUM PURCHASE
// ============================================
function selectPlan(planKey) {
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) return;

  if (tg) tg.HapticFeedback?.impactOccurred('medium');

  const modal = document.getElementById('paymentModal');
  modal.classList.add('open');
  modal.dataset.plan = planKey;

  document.getElementById('payPlanLabel').textContent = plan.label;
  document.getElementById('payPlanPrice').textContent = plan.price + ' сомонӣ';

  // Payload барои админ
  const payload = `premium_${planKey}_${user.id}`;
  document.getElementById('payComment').textContent = payload;
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('open');
}

function confirmPayment() {
  const planKey = document.getElementById('paymentModal').dataset.plan;
  const plan = PREMIUM_PLANS[planKey];

  premium.paymentStatus = 'pending';
  premium.plan = planKey;
  store.set('premium', premium);

  // Ба админ хабар
  if (tg) {
    const msg = `🆕 Дархости Premium\n\n` +
                `👤 ${user.first_name} (@${user.username || '—'})\n` +
                `🆔 ${user.id}\n` +
                `📦 Нақша: ${plan.label}\n` +
                `💰 Нарх: ${plan.price} сомонӣ`;
    // Бо бот фиристодан мумкин (танҳо агар backend дошта бошед)
  }

  closePaymentModal();
  showToast('✅ Дархост фиристода шуд! Тасдиқро интизор шавед.');
}

// Админ тасдиқ мекунад
function approvePremium(userId, planKey, customDays) {
  // Дар demo мо танҳо ба худи админ медиҳем
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) return;
  const days = customDays || plan.days;

  premium.active = true;
  premium.plan = planKey;
  premium.startedAt = Date.now();
  premium.expiresAt = Date.now() + days * 86400000;
  premium.paymentStatus = 'approved';
  store.set('premium', premium);

  checkPremiumExpiry();
  updatePremiumUI();
  renderProfile();
  renderAll();
  startPremiumTimer();
  showToast(`👑 Premium фаъол шуд: ${days} рӯз`);
}

// ============================================
// THEME
// ============================================
function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  document.querySelector('#themeIcon use').setAttribute('href', isLight ? '#i-sun' : '#i-moon');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
}

// ============================================
// TOAST
// ============================================
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

// ============================================
// ICON HELPER
// ============================================
function icon(name, cls = '') {
  return `<svg class="icon ${cls}"><use href="#${name}"/></svg>`;
}

// ============================================================
// STATISTICS (Омор)
// ============================================================
function renderStatistics() {
  if (!LESSONS || LESSONS.length === 0) return;

  const total = LESSONS.length;
  const done = progress.completedLessons.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  // Overview
  document.getElementById('ovTotalLessons').textContent = total;
  document.getElementById('ovDone').textContent = done;
  document.getElementById('ovPercent').textContent = percent + '%';
  document.getElementById('progressBadge').textContent = `${done} / ${total}`;
  document.getElementById('bigProgressBar').style.width = percent + '%';

  // By level
  const levels = {
    'Ибтидоӣ': { color: '#6366f1', total: 0, done: 0 },
    'Миёна': { color: '#f59e0b', total: 0, done: 0 },
    'Пешрафта': { color: '#10b981', total: 0, done: 0 },
    'Street English': { color: '#ec4899', total: 0, done: 0 }
  };

  LESSONS.forEach(l => {
    if (levels[l.level]) {
      levels[l.level].total++;
      if (progress.completedLessons.includes(l.id)) {
        levels[l.level].done++;
      }
    }
  });

  const levelContainer = document.getElementById('levelStats');
  levelContainer.innerHTML = Object.entries(levels)
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
        </div>
      `;
    }).join('');

  // Score chart — охирин 20 тест
  const scores = progress.testScores || {};
  const scoreIds = Object.keys(scores).map(Number).sort((a, b) => a - b).slice(-20);
  const chart = document.getElementById('scoreChart');

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

  // Words learned
  const wordsLearned = progress.completedLessons.reduce((sum, id) => {
    const l = LESSONS.find(x => x.id === id);
    return sum + (l?.wordsCount || 0);
  }, 0);
  document.getElementById('wordsLearned').textContent = wordsLearned;
}

// ============================================================
// SAVED LESSONS (Дарсҳои нигоҳдошта)
// ============================================================
let savedLessons = store.get('savedLessons', []);

function toggleBookmark(lessonId) {
  const idx = savedLessons.indexOf(lessonId);
  if (idx > -1) {
    savedLessons.splice(idx, 1);
    showToast('Аз нигоҳдошта хориҷ шуд');
  } else {
    savedLessons.push(lessonId);
    showToast('Ба нигоҳдошта илова шуд');
  }
  store.set('savedLessons', savedLessons);

  // Update UI
  document.querySelectorAll(`.lesson-bookmark[data-id="${lessonId}"]`).forEach(btn => {
    btn.classList.toggle('active', savedLessons.includes(lessonId));
  });

  renderSavedLessons();
  if (tg) tg.HapticFeedback?.impactOccurred('light');
}

function renderSavedLessons() {
  const container = document.getElementById('savedLessons');
  if (!container) return;

  if (savedLessons.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg class="icon icon-2xl"><use href="#i-bookmark"/></svg>
        </div>
        <h3>Ҳоло дарс нигоҳ дошта нашудааст</h3>
        <p>Барои нигоҳ доштан, дар саҳифаи дарсҳо тугмаи bookmark-ро пахш кунед</p>
        <button class="btn-primary" onclick="navigateTo('lessons')">
          <svg class="icon icon-sm"><use href="#i-book"/></svg>
          Ба дарсҳо
        </button>
      </div>`;
    return;
  }

  const saved = LESSONS.filter(l => savedLessons.includes(l.id));
  container.innerHTML = saved.map(l => lessonCardHTML(l)).join('');
  bindLessonClicks();

  // Bookmark тугмаҳоро илова кун
  container.querySelectorAll('.lesson-card').forEach(card => {
    addBookmarkButton(card, parseInt(card.dataset.id));
  });
}

function addBookmarkButton(card, id) {
  if (card.querySelector('.lesson-bookmark')) return;

  const btn = document.createElement('button');
  btn.className = 'lesson-bookmark ' + (savedLessons.includes(id) ? 'active' : '');
  btn.dataset.id = id;
  btn.innerHTML = `<svg class="icon icon-sm"><use href="#i-bookmark"/></svg>`;
  btn.onclick = (e) => {
    e.stopPropagation();
    toggleBookmark(id);
  };
  card.appendChild(btn);
}

// ============================================================
// SETTINGS (Танзимот)
// ============================================================
let settings = store.get('settings', {
  dark: true,
  animations: true,
  sound: true,
  streak: false,
  notif: true
});

function initSettings() {
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val;
  };
  setCheck('settingDark', settings.dark);
  setCheck('settingAnimations', settings.animations);
  setCheck('settingSound', settings.sound);
  setCheck('settingStreak', settings.streak);
  setCheck('settingNotif', settings.notif);

  // Dark toggle
  document.getElementById('settingDark')?.addEventListener('change', (e) => {
    settings.dark = e.target.checked;
    store.set('settings', settings);
    document.body.classList.toggle('light', !settings.dark);
    document.querySelector('#themeIcon use').setAttribute('href',
      settings.dark ? '#i-moon' : '#i-sun');
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  });

  // Animations
  document.getElementById('settingAnimations')?.addEventListener('change', (e) => {
    settings.animations = e.target.checked;
    store.set('settings', settings);
    document.body.style.setProperty('--anim-speed', settings.animations ? '1' : '0');
    document.documentElement.classList.toggle('no-animations', !settings.animations);
  });

  // Sound
  document.getElementById('settingSound')?.addEventListener('change', (e) => {
    settings.sound = e.target.checked;
    store.set('settings', settings);
  });

  // Streak
  document.getElementById('settingStreak')?.addEventListener('change', (e) => {
    settings.streak = e.target.checked;
    store.set('settings', settings);
    if (settings.streak && tg) {
      tg.showPopup({
        title: 'Огоҳии ҳаррӯза',
        message: 'Ҳар рӯз соати 9:00 огоҳинома мефиристем',
        buttons: [{ type: 'close' }]
      });
    }
  });

  // Notif
  document.getElementById('settingNotif')?.addEventListener('change', (e) => {
    settings.notif = e.target.checked;
    store.set('settings', settings);
  });
}

function exportData() {
  const data = {
    progress,
    premium,
    savedLessons,
    settings,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `englishpro-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Маълумот содир шуд ✓');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.progress) {
          progress = data.progress;
          store.set('progress', progress);
        }
        if (data.premium) {
          premium = data.premium;
          store.set('premium', premium);
        }
        if (data.savedLessons) {
          savedLessons = data.savedLessons;
          store.set('savedLessons', savedLessons);
        }
        if (data.settings) {
          settings = data.settings;
          store.set('settings', settings);
        }
        showToast('Маълумот барқарор шуд ✓');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        showToast('Хато: файли нодуруст');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function confirmResetAll() {
  if (!confirm('Ҳамаи маълумот нест мешавад. Мутмаин ҳастед?')) return;
  if (!confirm('Ин амалро бекор кардан мумкин нест!')) return;

  store.del('progress');
  store.del('premium');
  store.del('savedLessons');
  store.del('settings');
  store.del('allUsers');

  showToast('Ҳамаи маълумот нест шуд');
  setTimeout(() => location.reload(), 1000);
}

// ============================================================
// HELP (Кӯмак)
// ============================================================
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  // Ҳамаро пӯш кун
  document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
  // Инро кушо
  if (!isOpen) el.classList.add('open');
  if (tg) tg.HapticFeedback?.impactOccurred('light');
}

function scrollToHelp(section) {
  const el = document.getElementById('help-' + section);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================
// SUPPORT (Дастгирӣ)
// ============================================================
function sendSupportMessage() {
  const msg = document.getElementById('supportMessage')?.value.trim();
  if (!msg) {
    showToast('Паёмро нависед');
    return;
  }
  if (msg.length < 5) {
    showToast('Паём хеле кӯтоҳ аст');
    return;
  }

  // Ба админ дар Telegram фиристодан
  const adminId = 8406121228;
  const userInfo = `👤 ${user.first_name} (@${user.username || '—'})\n🆔 ${user.id}`;
  const fullMsg = `📩 Паём аз корбар:\n\n${userInfo}\n\n💬 ${msg}`;

  if (tg) {
    tg.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(fullMsg)}`);
    tg.HapticFeedback?.notificationOccurred('success');
  } else {
    window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(fullMsg)}`, '_blank');
  }

  document.getElementById('supportMessage').value = '';
  showToast('Паём фиристода шуд ✓');
}

// ============================================================
// NAVIGATION UPDATE — Илова ба navigateTo()
// ============================================================
// Дар функсияи асосии navigateTo() инро илова кунед:
const _origNavigateTo = navigateTo;
navigateTo = function(pageName) {
  _origNavigateTo(pageName);

  // Рендер кардани саҳифаҳои нав ҳангоми кушодан
  if (pageName === 'stats')     renderStatistics();
  if (pageName === 'saved')     renderSavedLessons();
  if (pageName === 'settings')  initSettings();
  if (pageName === 'support')   initSupportPage();
};

function initSupportPage() {
  // Support Telegram-ро бо ID-и корбар танзим кун
  const link = document.getElementById('tgSupport');
  if (link) {
    // Метавонед рақами админро ин ҷо гузоред
    // link.href = 'https://t.me/YourUsername';
  }
}

// ============================================================
// INIT — илова ба initApp()
// ============================================================
// Дар охири initApp() инро илова кунед:
// initSettings();
// Танзимоти мавзӯъро татбиқ кун
if (settings.dark === false) {
  document.body.classList.add('light');
  document.querySelector('#themeIcon use').setAttribute('href', '#i-sun');
}
if (settings.animations === false) {
  document.documentElement.classList.add('no-animations');
}

