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
    console.warn('⛔ Шумо админ нестед — Admin Panel кор намекунад');
    return;
  }

  // Тугмаҳои амалҳои админ
  const adminButtons = document.querySelectorAll('[data-admin-action]');
  console.log('🔘 Тугмаҳои админ ёфт шуданд:', adminButtons.length);

  adminButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.adminAction;
      console.log('👆 Тугма пахш шуд:', action);

      if (action === 'give-premium') {
        const plan = document.getElementById('adminPlanSelect')?.value || '1month';
        givePremiumSelf(plan);
      }

      if (action === 'unlock-all') {
        if (confirm('Ҳамаи дарсҳоро кушоем?')) {
          const progress = store.get('progress', { completedLessons: [], testScores: {} });
          progress.completedLessons = LESSONS.map(l => l.id);
          store.set('progress', progress);
          location.reload();
        }
      }

      if (action === 'reset-progress') {
        if (confirm('Пешрафт нест карда шавад?')) {
          store.set('progress', { completedLessons: [], testScores: {}, streak: 0 });
          location.reload();
        }
      }

      if (action === 'reset-premium') {
        store.set('premium', { active: false });
        store.set('premiumUnlockedLessons', []);
        showToast('Premium нест шуд');
        setTimeout(() => location.reload(), 1000);
      }
    });
  });

  // User search
  const searchBtn = document.getElementById('adminSearchBtn');
  const searchInput = document.getElementById('adminUserSearch');
  if (searchBtn) {
    searchBtn.addEventListener('click', adminSearchUser);
    console.log('✅ Тугмаи ҷустуҷӯ пайваст шуд');
  } else {
    console.warn('⚠️ adminSearchBtn ёфт нашуд');
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') adminSearchUser();
    });
  }

  startOrdersListener();
  console.log('✅ Admin Panel омода');
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
    result.innerHTML = `<div style="text-align:center;padding:16px;color:#ef4444;font-size:12px">❌ Firebase пайваст нест</div>`;
    return;
  }

  result.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-2);font-size:12px">🔍 Ҷустуҷӯ...</div>`;
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

    // 2. Ҳамчун @username
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
      result.innerHTML = `<div style="text-align:center;padding:16px;color:#ef4444;font-size:12px">❌ Корбар ёфт нашуд<br><span style="font-size:10px;color:var(--text-2)">Танҳо корбароне, ки барномаро кушодаанд</span></div>`;
      return;
    }

    foundUser = { ...userData, _key: foundKey };
    renderFoundUser(userData, foundKey);
  } catch (e) {
    console.error(e);
    result.innerHTML = `<div style="text-align:center;padding:16px;color:#ef4444;font-size:12px">Хато: ${escapeHtmlLocal(e.message)}</div>`;
  }
}

function renderFoundUser(u, key) {
  const result = document.getElementById('adminUserResult');
  if (!result) return;

  const isPrem = u.isPremium && Date.now() < (u.premiumExpiresAt || 0);
  const exp = u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toLocaleString('tg-TJ') : '—';
  const initial = (u.name || 'U').charAt(0).toUpperCase();
  const photo = u.photo
    ? `<img src="${u.photo}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;border-radius:12px" onerror="this.parentElement.innerHTML='<span style=\\'color:#fff;font-weight:800;font-size:18px\\'>${initial}</span>'">`
    : `<span style="color:#fff;font-weight:800;font-size:18px">${initial}</span>`;

  result.innerHTML = `
    <div class="order-card" style="background:var(--bg-2);border:1px solid var(--card-border);border-radius:16px;padding:14px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">${photo}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${escapeHtmlLocal(u.name || 'Корбар')} ${isPrem ? '👑' : ''}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            ID: ${key} · ${u.username ? '@' + escapeHtmlLocal(u.username) : '—'}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px;background:rgba(99,102,241,0.08);border-radius:10px;margin-bottom:12px">
        <div style="font-size:12px;color:var(--text-2)">📚 Дарсҳо: <strong style="color:var(--text)">${u.lessonsCount || 0}</strong></div>
        <div style="font-size:12px;color:var(--text-2);text-align:right">⭐ Хол: <strong style="color:#fbbf24">${u.totalScore || 0}</strong></div>
        <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">
          ${isPrem
            ? `👑 Premium: <strong style="color:#fbbf24">${u.premiumPlan || '—'}</strong> · то ${exp}`
            : '🚫 Premium нест'}
        </div>
      </div>

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
}

// ============================================================
// ✅ GIVE PREMIUM TO USER
// ============================================================
async function adminGivePremiumToUser(userId) {
  const sel = document.getElementById('adminUserPlanSelect');
  const planKey = sel?.value || '1month';
  const plan = ADMIN_PLANS[planKey];
  if (!plan) return;

  if (!confirm(`Ба корбар ${userId} Premium (${plan.label}) тӯҳфа дода шавад?`)) return;

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

    setTimeout(adminSearchUser, 500);
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

    setTimeout(adminSearchUser, 500);
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
}

function orderCardHTML(order) {
  const initial = (order.userName || 'U').charAt(0).toUpperCase();
  const date = new Date(order.createdAt).toLocaleString('tg-TJ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return `
    <div class="order-card" style="background:var(--bg-2);border:1px solid var(--card-border);border-radius:16px;padding:14px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;">${escapeHtmlLocal(initial)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${escapeHtmlLocal(order.userName || 'Корбар')}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            ID: ${order.userId} · ${order.userUsername ? '@' + escapeHtmlLocal(order.userUsername) : '—'}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px;background:rgba(99,102,241,0.08);border-radius:10px;margin-bottom:12px;">
        <div style="font-size:12px;color:var(--text-2)">📦 <strong style="color:var(--text)">${escapeHtmlLocal(order.planLabel)}</strong></div>
        <div style="font-size:12px;color:var(--text-2);text-align:right">💰 <strong style="color:#fbbf24">${order.planPrice} с.</strong></div>
        <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">⏱ ${date}</div>
      </div>

      ${order.photo ? `
        <div style="margin-bottom:12px;cursor:pointer" onclick="viewPhotoFull('${order.id}')">
          <img src="${order.photo}" referrerpolicy="no-referrer" style="width:100%;border-radius:12px;max-height:220px;object-fit:cover;background:#0f172a;display:block;" onerror="this.style.display='none'">
          <div style="text-align:center;font-size:11px;color:var(--text-2);margin-top:6px">👆 Пахш кунед, то калон кушоед</div>
        </div>
      ` : `
        <div style="padding:20px;background:rgba(148,163,184,0.08);border-radius:10px;text-align:center;font-size:12px;color:var(--text-2);margin-bottom:12px">📷 Расм нест</div>
      `}

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
// ДУ БОР КӮШИШ — ҳам фавран, ҳам баъд аз 1 сония
// ============================================================
window.addEventListener('load', () => {
  // Кӯшиши 1: фавран
  setTimeout(initAdminPanel, 500);
  // Кӯшиши 2: баъд аз 2 сония (эҳтиёт)
  setTimeout(() => {
    if (document.querySelectorAll('[data-admin-action]').length > 0) {
      // Санҷед, ки оё аллакай пайваст шудааст
      const btn = document.querySelector('[data-admin-action="give-premium"]');
      if (btn && !btn.dataset.bound) {
        console.log('🔄 Кӯшиши 2 — тугмаҳоро пайваст мекунам');
        initAdminPanel();
      }
    }
  }, 2000);
});
