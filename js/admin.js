// ============================================================
// ADMIN PANEL — Premium Orders + User Management
// ============================================================
const ADMIN_ID_LOCAL = 8406121228;
const user_admin = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
const IS_ADMIN_LOCAL = Number(user_admin.id) === ADMIN_ID_LOCAL;

console.log('🔍 ADMIN CHECK:', {
  myId: user_admin.id,
  adminId: ADMIN_ID_LOCAL,
  isAdmin: IS_ADMIN_LOCAL
});

let currentOrders = [];
let foundUser = null;
let allAdminUsers = [];
let adminUsersListener = null;

const ADMIN_PLANS = {
  '1day':   { label: '1 рӯз',   price: 4,    days: 1 },
  '1week':  { label: '1 ҳафта', price: 25,   days: 7 },
  '1month': { label: '1 моҳ',   price: 100,  days: 30 },
  '1year':  { label: '1 сол',   price: 1199, days: 365 }
};

// ============================================================
// INIT
// ============================================================
function initAdminPanel() {
  console.log('🚀 initAdminPanel даъват шуд, IS_ADMIN_LOCAL =', IS_ADMIN_LOCAL);

  if (!IS_ADMIN_LOCAL) {
    console.warn('⛔ Шумо админ нестед');
    return;
  }

  // --- Тугмаҳои амалҳои админ ---
  const adminButtons = document.querySelectorAll('[data-admin-action]');
  adminButtons.forEach(btn => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', () => {
      const action = btn.dataset.adminAction;

      if (action === 'give-premium') {
        const plan = document.getElementById('adminPlanSelect')?.value || '1month';
        givePremiumSelf(plan);
      }

      if (action === 'unlock-all') {
        if (confirm('Ҳамаи дарсҳоро кушоем?')) {
          const progress = store.get('progress', { completedLessons: [], testScores: {} });
          progress.completedLessons = LESSONS.map(l => l.id);
          store.set('progress', progress);

          if (typeof saveProgressToFirebase === 'function' && user_admin.id) {
            saveProgressToFirebase(user_admin.id, progress);
          }

          location.reload();
        }
      }

      if (action === 'reset-progress') {
        if (confirm('Пешрафт нест карда шавад?')) {
          const empty = { completedLessons: [], testScores: {}, streak: 0 };
          store.set('progress', empty);

          if (typeof saveProgressToFirebase === 'function' && user_admin.id) {
            saveProgressToFirebase(user_admin.id, empty);
          }

          location.reload();
        }
      }

      if (action === 'reset-premium') {
        store.set('premium', { active: false });
        store.set('premiumUnlockedLessons', []);

        if (typeof db !== 'undefined' && db && user_admin.id) {
          db.ref('users/' + user_admin.id).update({
            isPremium: false,
            premiumPlan: null,
            premiumStartedAt: null,
            premiumExpiresAt: null
          }).catch(err => console.error(err));
        }

        showToast('Premium нест шуд');
        setTimeout(() => location.reload(), 1000);
      }
    });
  });

  // --- User Search ---
  const searchBtn = document.getElementById('adminSearchBtn');
  const searchInput = document.getElementById('adminUserSearch');

  if (searchBtn && searchBtn.dataset.bound !== '1') {
    searchBtn.dataset.bound = '1';
    searchBtn.addEventListener('click', adminSearchUser);
  }

  if (searchInput && searchInput.dataset.bound !== '1') {
    searchInput.dataset.bound = '1';
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') adminSearchUser();
    });
  }

  // --- Рӯйхати ҳамаи корбарон ---
  initAdminUsersList();

  // --- Orders Listener ---
  startOrdersListener();

  console.log('✅ Admin Panel омода');
}

// ============================================================
// 👥 РӮЙХАТИ ҲАМАИ КОРБАРОН
// ============================================================
function initAdminUsersList() {
  if (!IS_ADMIN_LOCAL) return;

  if (typeof db === 'undefined' || !db) {
    setTimeout(initAdminUsersList, 1000);
    return;
  }

  if (adminUsersListener) {
    try { db.ref('users').off('value', adminUsersListener); } catch (e) {}
    adminUsersListener = null;
  }

  adminUsersListener = db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(500)
    .on('value', snap => {
      const users = [];
      snap.forEach(child => {
        const u = child.val();
        if (u && u.id) {
          users.push({ ...u, _key: child.key });
        }
      });

      users.sort((a, b) => {
        const aPrem = a.isPremium && Date.now() < (a.premiumExpiresAt || 0) ? 1 : 0;
        const bPrem = b.isPremium && Date.now() < (b.premiumExpiresAt || 0) ? 1 : 0;
        if (aPrem !== bPrem) return bPrem - aPrem;
        return (b.totalScore || 0) - (a.totalScore || 0);
      });

      allAdminUsers = users;
      renderAdminUsersList(users);
    }, err => {
      console.error('❌ Admin users list error:', err);
      loadUsersFallback();
    });
}

function loadUsersFallback() {
  if (typeof db === 'undefined' || !db) return;

  db.ref('users').once('value')
    .then(snap => {
      const users = [];
      snap.forEach(child => {
        const u = child.val();
        if (u && u.id) {
          users.push({ ...u, _key: child.key });
        }
      });

      users.sort((a, b) => {
        const aPrem = a.isPremium && Date.now() < (a.premiumExpiresAt || 0) ? 1 : 0;
        const bPrem = b.isPremium && Date.now() < (b.premiumExpiresAt || 0) ? 1 : 0;
        if (aPrem !== bPrem) return bPrem - aPrem;
        return (b.totalScore || 0) - (a.totalScore || 0);
      });

      allAdminUsers = users;
      renderAdminUsersList(users);
    })
    .catch(err => {
      console.error('❌ Fallback error:', err);
      const localUsers = Object.values(store.get('allUsers', {}))
        .filter(u => u && u.id)
        .map(u => ({ ...u, _key: String(u.id) }));

      allAdminUsers = localUsers;
      renderAdminUsersList(localUsers);
    });
}

function renderAdminUsersList(users) {
  const container = document.getElementById('adminUsersList');
  const countEl = document.getElementById('adminUsersCount');
  if (!container) return;

  if (countEl) countEl.textContent = users.length;

  if (!users || users.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px 20px;color:var(--text-2);font-size:12px">
        <div style="font-size:40px;margin-bottom:8px">👤</div>
        Ҳоло корбар нест
      </div>`;
    return;
  }

  container.innerHTML = users.map(u => adminUserRowHTML(u)).join('');

  // 🔴 Маҷбуран хурд кардани расмҳо
  setTimeout(forceSmallAvatars, 50);
}

// ============================================================
// 🔴 КОРТИ КОРБАР — расми мураббаъ 52×52
// ============================================================
function adminUserRowHTML(u) {
  const isPrem = u.isPremium && Date.now() < (u.premiumExpiresAt || 0);
  const initial = (u.name || 'U').trim().charAt(0).toUpperCase();

  const photo = u.photo
    ? `<img src="${u.photo}" referrerpolicy="no-referrer" 
            onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">`
    : `<span class="avatar-letter">${initial}</span>`;

  return `
    <div class="admin-user-card" onclick="adminOpenUser('${u._key}')">
      <div class="admin-user-avatar">${photo}</div>

      <div class="admin-user-info">
        <div class="admin-user-name">
          ${escapeHtmlLocal(u.name || 'Корбар')}
          ${isPrem ? '<span class="emoji">👑</span>' : ''}
          ${u.isAdmin ? '<span class="emoji">🛡</span>' : ''}
        </div>
        <div class="admin-user-meta">
          ID: ${u.id} · ${u.lessonsCount || 0} дарс · ${u.totalScore || 0} хол
        </div>
        <span class="admin-user-badge ${isPrem ? 'premium' : 'free'}">
          ${isPrem ? '👑 Premium' : 'Free'}
        </span>
      </div>
    </div>
  `;
}

// ============================================================
// 👆 ИНТИХОБИ КОРБАР АЗ РӮЙХАТ
// ============================================================
function adminOpenUser(userId) {
  const u = allAdminUsers.find(x => String(x._key) === String(userId));
  if (!u) return;

  const result = document.getElementById('adminUserResult');
  if (!result) return;

  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderFoundUser(u, u._key);
}

// ============================================================
// 🔎 USER SEARCH
// ============================================================
async function adminSearchUser() {
  const query = (document.getElementById('adminUserSearch')?.value || '').trim();
  const result = document.getElementById('adminUserResult');
  if (!result) return;

  if (!query) { showToast('ID ё @username нависед'); return; }

  if (typeof db === 'undefined' || !db) {
    result.innerHTML = `<div class="admin-user-empty">❌ Firebase пайваст нест</div>`;
    return;
  }

  result.innerHTML = `<div class="admin-user-empty">🔍 Ҷустуҷӯ...</div>`;
  foundUser = null;

  try {
    let userData = null;
    let foundKey = null;

    // 1. Ҳамчун ID
    const idNum = Number(query);
    if (!isNaN(idNum) && idNum > 0) {
      const snap = await db.ref('users/' + idNum).once('value');
      if (snap.exists()) {
        userData = snap.val();
        foundKey = String(idNum);
      }
    }

    // 2. Ҳамчун @username — аз рӯйхати аллакай боршуда
    if (!userData && allAdminUsers.length > 0) {
      const cleanUsername = query.replace(/^@/, '').toLowerCase();
      const found = allAdminUsers.find(u =>
        u.username && String(u.username).toLowerCase() === cleanUsername
      );
      if (found) {
        userData = found;
        foundKey = found._key;
      }
    }

    // 3. Ҳамчун @username — аз Firebase
    if (!userData) {
      const cleanUsername = query.replace(/^@/, '').toLowerCase();
      const snap = await db.ref('users').once('value');
      snap.forEach(child => {
        const v = child.val();
        if (v && v.username && String(v.username).toLowerCase() === cleanUsername) {
          userData = v;
          foundKey = child.key;
        }
      });
    }

    if (!userData) {
      result.innerHTML = `<div class="admin-user-empty">❌ Корбар ёфт нашуд</div>`;
      return;
    }

    foundUser = { ...userData, _key: foundKey };
    renderFoundUser(userData, foundKey);
  } catch (e) {
    console.error(e);
    result.innerHTML = `<div class="admin-user-empty">Хато: ${escapeHtmlLocal(e.message)}</div>`;
  }
}

// ============================================================
// 🔴 RENDER — корти корбари ёфтшуда
// ============================================================
function renderFoundUser(u, key) {
  const result = document.getElementById('adminUserResult');
  if (!result) return;

  const isPrem = u.isPremium && Date.now() < (u.premiumExpiresAt || 0);
  const exp = u.premiumExpiresAt
    ? new Date(u.premiumExpiresAt).toLocaleString('tg-TJ')
    : '—';
  const initial = (u.name || 'U').charAt(0).toUpperCase();

  const photo = u.photo
    ? `<img src="${u.photo}" referrerpolicy="no-referrer"
            onerror="this.parentElement.innerHTML='<span class=\\'avatar-letter\\'>${initial}</span>'">`
    : `<span class="avatar-letter">${initial}</span>`;

  result.innerHTML = `
    <div class="admin-user-card" style="flex-direction:column;align-items:stretch;gap:12px;padding:14px">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px">
        <div class="admin-user-avatar">${photo}</div>
        <div class="admin-user-info">
          <div class="admin-user-name">
            ${escapeHtmlLocal(u.name || 'Корбар')}
            ${isPrem ? '<span class="emoji">👑</span>' : ''}
            ${u.isAdmin ? '<span class="emoji">🛡</span>' : ''}
          </div>
          <div class="admin-user-meta">
            ID: ${key} · ${u.username ? '@' + escapeHtmlLocal(u.username) : '—'}
          </div>
          <span class="admin-user-badge ${isPrem ? 'premium' : 'free'}">
            ${isPrem ? '👑 Premium' : 'Free'}
          </span>
        </div>
        <button onclick="closeAdminUserResult()"
          style="width:34px;height:34px;border-radius:50%;border:1px solid var(--card-border);background:var(--bg-2);color:var(--text-2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
          ✕
        </button>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px;background:rgba(99,102,241,0.08);border-radius:10px">
        <div style="font-size:12px;color:var(--text-2)">
          📚 Дарсҳо: <strong style="color:var(--text)">${u.lessonsCount || 0}</strong>
        </div>
        <div style="font-size:12px;color:var(--text-2);text-align:right">
          ⭐ Хол: <strong style="color:#fbbf24">${u.totalScore || 0}</strong>
        </div>
        <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">
          ${isPrem
            ? `👑 Premium: <strong style="color:#fbbf24">${u.premiumPlan || '—'}</strong> · то ${exp}`
            : '🚫 Premium нест'}
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px">
          <select id="adminUserPlanSelect" class="admin-select" style="flex:1;margin:0">
            <option value="1day">1 рӯз (4 с.)</option>
            <option value="1week">1 ҳафта (25 с.)</option>
            <option value="1month" selected>1 моҳ (100 с.)</option>
            <option value="1year">1 сол (1199 с.)</option>
          </select>
          <button onclick="adminGivePremiumToUser('${key}')"
            style="padding:12px 16px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;white-space:nowrap">
            ${isPrem ? '🔄 Дароз' : '✅ Додан'}
          </button>
        </div>
        ${isPrem ? `
          <button onclick="adminRemovePremiumFromUser('${key}')"
            style="padding:12px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">
            🚫 Premium хомӯш кардан
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // 🔴 Маҷбуран хурд кардани расм
  setTimeout(forceSmallAvatars, 50);
}

function closeAdminUserResult() {
  const result = document.getElementById('adminUserResult');
  if (result) result.innerHTML = '';
  foundUser = null;
}

// ============================================================
// ✅ GIVE PREMIUM (бо тӯҳфа)
// ============================================================
async function adminGivePremiumToUser(userId) {
  const sel = document.getElementById('adminUserPlanSelect');
  const planKey = sel?.value || '1month';
  const plan = ADMIN_PLANS[planKey];
  if (!plan) return;

  if (!confirm(`Ба корбар ${userId} Premium (${plan.label}) тӯҳфа дода шавад?`)) return;

  if (typeof db === 'undefined' || !db) {
    alert('Firebase пайваст нест');
    return;
  }

  try {
    const expiresAt = Date.now() + plan.days * 86400000;

    await db.ref('users/' + userId).update({
      isPremium: true,
      premiumPlan: planKey,
      premiumStartedAt: Date.now(),
      premiumExpiresAt: expiresAt
    });

    await db.ref('notifications/' + userId).push({
      type: 'premium_gifted',
      plan: planKey,
      planLabel: plan.label,
      days: plan.days,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      read: false
    });

    showToast(`🎁 Premium тӯҳфа дода шуд (${plan.label})`);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

    setTimeout(() => {
      const updated = allAdminUsers.find(x => String(x._key) === String(userId));
      if (updated) renderFoundUser(updated, userId);
    }, 600);
  } catch (e) {
    console.error(e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// 🚫 REMOVE PREMIUM
// ============================================================
async function adminRemovePremiumFromUser(userId) {
  if (!confirm(`Premium-и корбар ${userId} хомӯш карда шавад?`)) return;

  if (typeof db === 'undefined' || !db) {
    alert('Firebase пайваст нест');
    return;
  }

  try {
    await db.ref('users/' + userId).update({
      isPremium: false,
      premiumPlan: null,
      premiumStartedAt: null,
      premiumExpiresAt: null
    });

    await db.ref('notifications/' + userId).push({
      type: 'premium_removed',
      createdAt: Date.now(),
      read: false
    });

    showToast('🚫 Premium хомӯш шуд');
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

    setTimeout(() => {
      const updated = allAdminUsers.find(x => String(x._key) === String(userId));
      if (updated) renderFoundUser(updated, userId);
    }, 600);
  } catch (e) {
    console.error(e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// ORDERS LISTENER
// ============================================================
function startOrdersListener() {
  if (typeof db === 'undefined' || !db) {
    setTimeout(startOrdersListener, 1000);
    return;
  }

  db.ref('premium_orders').on('value', snap => {
    const orders = [];
    snap.forEach(child => {
      const val = child.val();
      if (val && val.status === 'pending') {
        orders.push({ id: child.key, ...val });
      }
    });
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    currentOrders = orders;
    renderPremiumOrders(orders);
  }, err => {
    console.error('Orders listener error:', err);
  });
}

function renderPremiumOrders(orders) {
  const container = document.getElementById('adminOrders');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px 20px;color:var(--text-2);font-size:13px;">
        <div style="font-size:44px;margin-bottom:10px;">📭</div>
        Ҳоло фармоиши нав нест
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:inline-block;padding:4px 12px;background:rgba(251,191,36,0.15);color:#fbbf24;border-radius:20px;font-size:11px;font-weight:800;margin-bottom:12px;">
      🔔 ${orders.length} фармоиши нав
    </div>
    ${orders.map(order => orderCardHTML(order)).join('')}
  `;

  setTimeout(forceSmallAvatars, 50);
}

// ============================================================
// 🔴 КОРТИ ФАРМОИШ — аватари 44×44
// ============================================================
function orderCardHTML(order) {
  const initial = (order.userName || 'U').charAt(0).toUpperCase();
  const date = new Date(order.createdAt).toLocaleString('tg-TJ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return `
    <div class="order-card">
      <!-- User -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div class="order-user-avatar">
          <span>${escapeHtmlLocal(initial)}</span>
        </div>
        <div style="flex:1;min-width:0">
          <div class="admin-user-name">${escapeHtmlLocal(order.userName || 'Корбар')}</div>
          <div class="admin-user-meta">
            ID: ${order.userId} · ${order.userUsername ? '@' + escapeHtmlLocal(order.userUsername) : '—'}
          </div>
        </div>
      </div>

      <!-- Info -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px;background:rgba(99,102,241,0.08);border-radius:10px;margin-bottom:12px;">
        <div style="font-size:12px;color:var(--text-2)">
          📦 <strong style="color:var(--text)">${escapeHtmlLocal(order.planLabel)}</strong>
        </div>
        <div style="font-size:12px;color:var(--text-2);text-align:right">
          💰 <strong style="color:#fbbf24">${order.planPrice} с.</strong>
        </div>
        <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">⏱ ${date}</div>
      </div>

      <!-- Photo -->
      ${order.photo ? `
        <div style="margin-bottom:12px;cursor:pointer" onclick="viewPhotoFull('${order.id}')">
          <img src="${order.photo}" 
               class="payment-screenshot"
               referrerpolicy="no-referrer"
               onerror="this.style.display='none'">
          <div style="text-align:center;font-size:11px;color:var(--text-2);margin-top:6px">
            👆 Пахш кунед, то калон кушоед
          </div>
        </div>
      ` : `
        <div style="padding:20px;background:rgba(148,163,184,0.08);border-radius:10px;text-align:center;font-size:12px;color:var(--text-2);margin-bottom:12px">
          📷 Расм нест
        </div>
      `}

      <!-- Buttons -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button onclick="approveOrder('${order.id}', ${order.userId}, '${order.plan}', ${order.planDays || 30})"
          style="padding:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">
          ✅ Қабул
        </button>
        <button onclick="rejectOrder('${order.id}', ${order.userId})"
          style="padding:12px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">
          ❌ Рад
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// PHOTO FULLSCREEN
// ============================================================
function viewPhotoFull(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order || !order.photo) return;

  document.getElementById('photoViewer')?.remove();

  const viewer = document.createElement('div');
  viewer.id = 'photoViewer';
  viewer.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;`;
  viewer.innerHTML = `
    <img src="${order.photo}" referrerpolicy="no-referrer" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;">
    <button onclick="document.getElementById('photoViewer').remove()" style="position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.15);color:#fff;border:none;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
  `;
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.remove(); });
  document.body.appendChild(viewer);
}

// ============================================================
// APPROVE ORDER
// ============================================================
async function approveOrder(orderId, userId, plan, days) {
  if (!confirm(`Қабули фармоиш?\nКорбар ID: ${userId}\nНақша: ${plan} (${days} рӯз)`)) return;

  if (typeof db === 'undefined' || !db) { alert('Firebase пайваст нест'); return; }

  try {
    const expiresAt = Date.now() + days * 86400000;

    await db.ref('premium_orders/' + orderId).update({
      status: 'approved',
      approvedAt: Date.now(),
      approvedBy: user_admin.id || ADMIN_ID_LOCAL
    });

    await db.ref('users/' + userId).update({
      isPremium: true,
      premiumPlan: plan,
      premiumStartedAt: Date.now(),
      premiumExpiresAt: expiresAt
    });

    await db.ref('notifications/' + userId).push({
      type: 'premium_approved',
      plan: plan,
      days: days,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      read: false
    });

    showToast('✅ Фармоиш қабул шуд');
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
  } catch (e) {
    console.error('Approve error:', e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// REJECT ORDER
// ============================================================
async function rejectOrder(orderId, userId) {
  const reason = prompt('Сабаби радкунӣ:', 'Скриншот нодуруст');
  if (reason === null) return;

  if (typeof db === 'undefined' || !db) { alert('Firebase пайваст нест'); return; }

  try {
    await db.ref('premium_orders/' + orderId).update({
      status: 'rejected',
      rejectedAt: Date.now(),
      rejectedBy: user_admin.id || ADMIN_ID_LOCAL,
      rejectReason: reason || 'Сабаб нишон дода нашуд'
    });

    await db.ref('notifications/' + userId).push({
      type: 'premium_rejected',
      reason: reason,
      createdAt: Date.now(),
      read: false
    });

    showToast('❌ Фармоиш рад шуд');
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
  } catch (e) {
    console.error('Reject error:', e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// UTILS
// ============================================================
function escapeHtmlLocal(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function givePremiumSelf(planKey) {
  const plans = { '1day': 1, '1week': 7, '1month': 30, '1year': 365 };
  const days = plans[planKey] || 30;
  store.set('premium', {
    active: true,
    plan: planKey,
    startedAt: Date.now(),
    expiresAt: Date.now() + days * 86400000
  });
  showToast(`👑 Premium фаъол: ${days} рӯз`);
  setTimeout(() => location.reload(), 800);
}

// ============================================================
// 🔴 FORCE SMALL AVATARS — JavaScript fallback
// Кафолат медиҳад, ки расмҳо ҳамеша хурд мешаванд
// ============================================================
function forceSmallAvatars() {
  // Аватарҳо дар рӯйхат ва кортҳо — 52×52 мураббаъ
  document.querySelectorAll(`
    #adminUsersList .admin-user-avatar,
    #adminUserResult .admin-user-avatar,
    .admin-user-card .admin-user-avatar,
    .admin-user-avatar
  `).forEach(el => {
    el.style.setProperty('width', '52px', 'important');
    el.style.setProperty('height', '52px', 'important');
    el.style.setProperty('min-width', '52px', 'important');
    el.style.setProperty('max-width', '52px', 'important');
    el.style.setProperty('min-height', '52px', 'important');
    el.style.setProperty('max-height', '52px', 'important');
    el.style.setProperty('border-radius', '14px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('flex-shrink', '0', 'important');
    el.style.setProperty('padding', '0', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('align-items', 'center', 'important');
    el.style.setProperty('justify-content', 'center', 'important');

    const img = el.querySelector('img');
    if (img) {
      img.style.setProperty('width', '52px', 'important');
      img.style.setProperty('height', '52px', 'important');
      img.style.setProperty('max-width', '52px', 'important');
      img.style.setProperty('max-height', '52px', 'important');
      img.style.setProperty('min-width', '52px', 'important');
      img.style.setProperty('min-height', '52px', 'important');
      img.style.setProperty('border-radius', '14px', 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
      img.style.setProperty('display', 'block', 'important');
    }
  });

  // Аватарҳо дар фармоиш — 44×44 мураббаъ
  document.querySelectorAll(`
    .order-user-avatar,
    .order-card .admin-user-avatar,
    #adminOrders .admin-user-avatar
  `).forEach(el => {
    el.style.setProperty('width', '44px', 'important');
    el.style.setProperty('height', '44px', 'important');
    el.style.setProperty('min-width', '44px', 'important');
    el.style.setProperty('max-width', '44px', 'important');
    el.style.setProperty('min-height', '44px', 'important');
    el.style.setProperty('max-height', '44px', 'important');
    el.style.setProperty('border-radius', '12px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('flex-shrink', '0', 'important');
    el.style.setProperty('padding', '0', 'important');
    el.style.setProperty('background', 'linear-gradient(135deg, #6366f1, #8b5cf6)');
    el.style.setProperty('color', '#fff');
    el.style.setProperty('font-weight', '700');
    el.style.setProperty('font-size', '17px');
    el.style.setProperty('display', 'flex');
    el.style.setProperty('align-items', 'center');
    el.style.setProperty('justify-content', 'center');

    const img = el.querySelector('img');
    if (img) {
      img.style.setProperty('width', '44px', 'important');
      img.style.setProperty('height', '44px', 'important');
      img.style.setProperty('max-width', '44px', 'important');
      img.style.setProperty('max-height', '44px', 'important');
      img.style.setProperty('border-radius', '12px', 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
    }
  });

  // 🔴 Скриншоти пардохт — истисно (калонтар)
  document.querySelectorAll(`
    .payment-screenshot,
    #adminOrders img[src*="i.ibb.co"],
    .order-card img[src*="i.ibb.co"]
  `).forEach(img => {
    img.style.setProperty('width', '100%', 'important');
    img.style.setProperty('height', 'auto', 'important');
    img.style.setProperty('max-width', '100%', 'important');
    img.style.setProperty('max-height', '220px', 'important');
    img.style.setProperty('object-fit', 'cover', 'important');
    img.style.setProperty('border-radius', '12px', 'important');
    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('background', '#0f172a', 'important');
  });
}

// Даъват ҳар 800ms — кафолат медиҳад, ки ҳатто HTML-и динамикӣ ҳам хурд мешавад
setInterval(() => {
  if (IS_ADMIN_LOCAL) forceSmallAvatars();
}, 800);

// ============================================================
// START
// ============================================================
window.addEventListener('load', () => {
  setTimeout(initAdminPanel, 500);
  setTimeout(() => {
    const btn = document.querySelector('[data-admin-action="give-premium"]');
    if (btn && btn.dataset.bound !== '1') {
      console.log('🔄 Кӯшиши 2 — тугмаҳоро пайваст мекунам');
      initAdminPanel();
    }
  }, 2000);
});
