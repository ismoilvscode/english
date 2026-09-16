// ============================================================
// ADMIN PANEL — v9
// ============================================================
const ADMIN_ID_LOCAL = 8406121228;
const user_admin = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
const IS_ADMIN_LOCAL = Number(user_admin.id) === ADMIN_ID_LOCAL;

let currentOrders = [];
let allUsersList = [];
let selectedUser = null;

const PREMIUM_PLANS_ADMIN = {
  '1day':   { label: '1 рӯз',   days: 1 },
  '1week':  { label: '1 ҳафта', days: 7 },
  '1month': { label: '1 моҳ',   days: 30 },
  '1year':  { label: '1 сол',   days: 365 }
};

// ============================================================
// INIT
// ============================================================
function initAdminPanel() {
  if (!IS_ADMIN_LOCAL) return;

  document.querySelectorAll('[data-admin-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAdminAction(btn.dataset.adminAction));
  });

  const si = document.getElementById('adminUserSearch');
  if (si) {
    let t = null;
    si.addEventListener('input', () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => renderUsersList(filterUsers(si.value)), 200);
    });
  }

  startOrdersListener();
  startUsersListener();
  console.log('✅ Admin Panel омода');
}

// ============================================================
// ACTIONS
// ============================================================
function handleAdminAction(action) {
  if (action === 'unlock-all') {
    if (confirm('Ҳамаи дарсҳоро кушоем?')) {
      const p = store.get('progress', { completedLessons: [], testScores: {} });
      p.completedLessons = LESSONS.map(l => l.id);
      store.set('progress', p);
      location.reload();
    }
  }
  if (action === 'reset-progress') {
    if (confirm('Пешрафт нест?')) {
      store.set('progress', { completedLessons: [], testScores: {}, streak: 0 });
      location.reload();
    }
  }
  if (action === 'give-premium-user')   givePremiumToSelectedUser();
  if (action === 'remove-premium-user') removePremiumFromSelectedUser();
}

// ============================================================
// USERS LIST
// ============================================================
function startUsersListener() {
  const cached = getAllCachedUsers();
  if (cached.length > 0) {
    allUsersList = cached;
    sortUsersList();
    const q = document.getElementById('adminUserSearch')?.value || '';
    renderUsersList(filterUsers(q));
    console.log(`⚡ ${cached.length} аз кэш`);
  } else {
    showLoadingState();
  }

  const fn = typeof listenAllUsersRealtime === 'function'
    ? listenAllUsersRealtime
    : (typeof listenRatingRealtime === 'function' ? listenRatingRealtime : null);

  if (!fn) { setTimeout(startUsersListener, 1000); return; }

  fn(users => {
    allUsersList = (users || []).filter(u => u && u.id);
    sortUsersList();
    cacheUsersToLocal();
    const q = document.getElementById('adminUserSearch')?.value || '';
    renderUsersList(filterUsers(q));
    console.log(`✅ ${allUsersList.length} аз Firebase`);
  });
}

// ============================================================
// HELPERS
// ============================================================
function sortUsersList() {
  allUsersList.sort((a, b) => {
    const ap = a.isPremium && a.premiumExpiresAt > Date.now() ? 1 : 0;
    const bp = b.isPremium && b.premiumExpiresAt > Date.now() ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return (b.totalScore || 0) - (a.totalScore || 0);
  });
}

function getAllCachedUsers() {
  try {
    const c = store.get('admin_users_cache', {});
    return Object.values(c).filter(u => u && u.id);
  } catch (e) { return []; }
}

function cacheUsersToLocal() {
  try {
    const o = {};
    allUsersList.forEach(u => { o[u.id] = u; });
    store.set('admin_users_cache', o);
  } catch (e) {}
}

function retryLoadUsers() {
  showLoadingState();
  startUsersListener();
}

function showLoadingState() {
  const l = document.getElementById('adminUsersList');
  if (!l) return;
  l.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-2);font-size:12px"><div class="loader" style="margin:0 auto 12px;width:24px;height:24px"></div>Бор мешавад...</div>`;
}

// ============================================================
// FILTER
// ============================================================
function filterUsers(query) {
  if (!query || !query.trim()) return allUsersList;
  const q = String(query).toLowerCase().trim();
  const byId = [], byName = [];
  for (const u of allUsersList) {
    if (String(u.id).includes(q)) { byId.push(u); continue; }
    const n = (u.name || '').toLowerCase();
    const un = (u.username || '').toLowerCase();
    if (n.includes(q) || un.includes(q)) byName.push(u);
  }
  return [...byId, ...byName];
}

// ============================================================
// RENDER USERS
// ============================================================
function renderUsersList(users) {
  const list = document.getElementById('adminUsersList');
  if (!list) return;

  if (!users.length) {
    list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-2);font-size:12px">🔍 Корбар ёфт нашуд</div>`;
    return;
  }

  list.innerHTML = users.slice(0, 100).map(u => {
    const sel = selectedUser && Number(selectedUser.id) === Number(u.id);
    const hp = u.isPremium && u.premiumExpiresAt && Date.now() < u.premiumExpiresAt;
    const initial = (u.name || 'U').charAt(0).toUpperCase();
    const hasPhoto = u.photo && typeof u.photo === 'string' && u.photo.length > 10;

    const av = hasPhoto
      ? `<div style="width:38px;height:38px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);${hp ? 'border:2px solid #fbbf24;' : 'border:2px solid transparent;'}box-sizing:content-box"><img src="${u.photo}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px\\'>${escapeHtmlLocal(initial)}</div>'"></div>`
      : `<div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;${hp ? 'border:2px solid #fbbf24;' : 'border:2px solid transparent;'}box-sizing:content-box">${escapeHtmlLocal(initial)}</div>`;

    return `<div onclick="selectAdminUser(${u.id})" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${sel ? 'rgba(99,102,241,0.18)' : 'var(--bg-2)'};border:1px solid ${sel ? 'var(--primary)' : 'var(--card-border)'};border-radius:12px;cursor:pointer;transition:all 0.2s">
      ${av}
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtmlLocal(u.name || 'Корбар')} ${hp ? '👑' : ''}</div>
        <div style="font-size:11px;color:var(--text-2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">ID: ${u.id}${u.username ? ' · @' + escapeHtmlLocal(u.username) : ''}</div>
      </div>
      <div style="font-size:11px;font-weight:700;color:#fbbf24;flex-shrink:0">${u.totalScore || 0}</div>
    </div>`;
  }).join('');
}

// ============================================================
// SELECT
// ============================================================
function selectAdminUser(userId) {
  const u = allUsersList.find(x => Number(x.id) === Number(userId));
  if (!u) return;
  selectedUser = u;

  const box = document.getElementById('adminSelectedUser');
  const nEl = document.getElementById('adminSelectedName');
  const sEl = document.getElementById('adminSelectedStatus');

  if (box) box.style.display = 'block';
  if (nEl) nEl.textContent = `${u.name || 'Корбар'} (ID: ${u.id})`;

  if (sEl) {
    const hp = u.isPremium && u.premiumExpiresAt && Date.now() < u.premiumExpiresAt;
    if (hp) {
      const d = Math.ceil((u.premiumExpiresAt - Date.now()) / 86400000);
      sEl.innerHTML = `👑 Premium — ${d} рӯз боқӣ`;
      sEl.style.color = '#fbbf24';
    } else {
      sEl.textContent = 'Free корбар';
      sEl.style.color = 'var(--text-2)';
    }
  }

  setTimeout(() => box?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  const q = document.getElementById('adminUserSearch')?.value || '';
  renderUsersList(filterUsers(q));
}

// ============================================================
// GIVE / REMOVE PREMIUM
// ============================================================
async function givePremiumToSelectedUser() {
  if (!selectedUser) { showToast('Корбарро интихоб кунед'); return; }
  const pk = document.getElementById('adminPlanSelect')?.value || '1month';
  const p = PREMIUM_PLANS_ADMIN[pk];
  if (!p) return;
  if (!confirm(`Ба ${selectedUser.name} Premium дода шавад?\n${p.label}`)) return;

  try {
    const expiresAt = Date.now() + p.days * 86400000;
    await db.ref('users/' + selectedUser.id).update({
      isPremium: true, premiumPlan: pk,
      premiumStartedAt: Date.now(), premiumExpiresAt: expiresAt
    });
    await db.ref('notifications/' + selectedUser.id).push({
      type: 'premium_approved', plan: pk, days: p.days,
      expiresAt, createdAt: Date.now(), read: false
    });
    showToast(`✅ Premium дода шуд: ${selectedUser.name}`);
    if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
  } catch (e) { alert('Хато: ' + e.message); }
}

async function removePremiumFromSelectedUser() {
  if (!selectedUser) { showToast('Корбарро интихоб кунед'); return; }
  if (!confirm(`Premium аз ${selectedUser.name} гирифта шавад?`)) return;

  try {
    await db.ref('users/' + selectedUser.id).update({
      isPremium: false, premiumPlan: null,
      premiumStartedAt: null, premiumExpiresAt: null
    });
    await db.ref('notifications/' + selectedUser.id).push({
      type: 'premium_revoked', createdAt: Date.now(), read: false
    });
    showToast(`❌ Premium гирифта шуд: ${selectedUser.name}`);
    if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
  } catch (e) { alert('Хато: ' + e.message); }
}

// ============================================================
// ORDERS
// ============================================================
function startOrdersListener() {
  if (typeof listenPremiumOrders !== 'function') { setTimeout(startOrdersListener, 1000); return; }
  listenPremiumOrders(orders => {
    currentOrders = orders;
    renderPremiumOrders(orders);
  });
}

function renderPremiumOrders(orders) {
  const c = document.getElementById('adminOrders');
  if (!c) return;
  if (!orders || !orders.length) {
    c.innerHTML = `<div style="text-align:center;padding:30px 20px;color:var(--text-2);font-size:13px"><div style="font-size:44px;margin-bottom:10px">📭</div>Ҳоло фармоиши нав нест</div>`;
    return;
  }
  c.innerHTML = `<div style="display:inline-block;padding:4px 12px;background:rgba(251,191,36,0.15);color:#fbbf24;border-radius:20px;font-size:11px;font-weight:800;margin-bottom:12px">🔔 ${orders.length} фармоиши нав</div>${orders.map(orderCardHTML).join('')}`;
}

function orderCardHTML(o) {
  const initial = (o.userName || 'U').charAt(0).toUpperCase();
  const date = new Date(o.createdAt).toLocaleString('tg-TJ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const ou = allUsersList.find(u => Number(u.id) === Number(o.userId));
  const up = ou?.photo;
  const hasPhoto = up && typeof up === 'string' && up.length > 10;

  const av = hasPhoto
    ? `<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6)"><img src="${up}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px\\'>${escapeHtmlLocal(initial)}</div>'"></div>`
    : `<div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px">${escapeHtmlLocal(initial)}</div>`;

  return `<div class="order-card" style="background:var(--bg-2);border:1px solid var(--card-border);border-radius:16px;padding:14px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      ${av}
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px">${escapeHtmlLocal(o.userName || 'Корбар')}</div>
        <div style="font-size:11px;color:var(--text-2);margin-top:2px">ID: ${o.userId} · ${o.userUsername ? '@' + escapeHtmlLocal(o.userUsername) : '—'}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px;background:rgba(99,102,241,0.08);border-radius:10px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--text-2)">📦 <strong style="color:var(--text)">${escapeHtmlLocal(o.planLabel)}</strong></div>
      <div style="font-size:12px;color:var(--text-2);text-align:right">💰 <strong style="color:#fbbf24">${o.planPrice} с.</strong></div>
      <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">⏱ ${date}</div>
    </div>
    ${o.photo ? `<div style="margin-bottom:12px;cursor:pointer" onclick="viewPhotoFull('${o.id}')"><img src="${o.photo}" loading="lazy" style="width:100%;border-radius:12px;max-height:220px;object-fit:cover;display:block" onerror="this.style.display='none'"></div>` : `<div style="padding:20px;background:rgba(148,163,184,0.08);border-radius:10px;text-align:center;font-size:12px;color:var(--text-2);margin-bottom:12px">📷 Расм нест</div>`}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button onclick="approveOrder('${o.id}', ${o.userId}, '${o.plan}', ${o.planDays || 30})" style="padding:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">✅ Қабул</button>
      <button onclick="rejectOrder('${o.id}', ${o.userId})" style="padding:12px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">❌ Рад</button>
    </div>
  </div>`;
}

function viewPhotoFull(orderId) {
  const o = currentOrders.find(x => x.id === orderId);
  if (!o || !o.photo) return;
  document.getElementById('photoViewer')?.remove();
  const v = document.createElement('div');
  v.id = 'photoViewer';
  v.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  v.innerHTML = `<img src="${o.photo}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:12px"><button onclick="document.getElementById('photoViewer').remove()" style="position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.15);color:#fff;border:none;font-size:22px;cursor:pointer">✕</button>`;
  v.addEventListener('click', e => { if (e.target === v) v.remove(); });
  document.body.appendChild(v);
}

async function approveOrder(orderId, userId, plan, days) {
  if (!confirm(`Қабули фармоиш?\nID: ${userId}\n${plan} (${days} рӯз)`)) return;
  try {
    const exp = Date.now() + days * 86400000;
    await db.ref('premium_orders/' + orderId).update({ status: 'approved', approvedAt: Date.now() });
    await db.ref('users/' + userId).update({ isPremium: true, premiumPlan: plan, premiumStartedAt: Date.now(), premiumExpiresAt: exp });
    await db.ref('notifications/' + userId).push({ type: 'premium_approved', plan, days, expiresAt: exp, createdAt: Date.now(), read: false });
    showToast('✅ Фармоиш қабул шуд');
    if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
  } catch (e) { alert('Хато: ' + e.message); }
}

async function rejectOrder(orderId, userId) {
  const r = prompt('Сабаби радкунӣ:', 'Скриншот нодуруст');
  if (r === null) return;
  try {
    await db.ref('premium_orders/' + orderId).update({ status: 'rejected', rejectedAt: Date.now(), rejectReason: r || '—' });
    await db.ref('notifications/' + userId).push({ type: 'premium_rejected', reason: r, createdAt: Date.now(), read: false });
    showToast('❌ Фармоиш рад шуд');
  } catch (e) { alert('Хато: ' + e.message); }
}

// ============================================================
// UTILS
// ============================================================
function escapeHtmlLocal(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

window.addEventListener('load', () => setTimeout(initAdminPanel, 2000));
