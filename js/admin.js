// ============================================================
// ADMIN PANEL — Premium Orders + User Management
// APP_VERSION: 6
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

  const searchInput = document.getElementById('adminUserSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderUsersList(filterUsers(searchInput.value));
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

  if (action === 'give-premium-user')   givePremiumToSelectedUser();
  if (action === 'remove-premium-user') removePremiumFromSelectedUser();
}

// ============================================================
// USERS LIST
// ============================================================
function startUsersListener() {
  if (typeof listenRatingRealtime !== 'function') {
    setTimeout(startUsersListener, 1000);
    return;
  }

  listenRatingRealtime(users => {
    allUsersList = (users || []).filter(u => u && u.id);
    // Сортировка: Premium аввал
    allUsersList.sort((a, b) => {
      const ap = a.isPremium && a.premiumExpiresAt > Date.now() ? 1 : 0;
      const bp = b.isPremium && b.premiumExpiresAt > Date.now() ? 1 : 0;
      return bp - ap;
    });
    const q = document.getElementById('adminUserSearch')?.value || '';
    renderUsersList(filterUsers(q));
  });
}

function filterUsers(query) {
  if (!query) return allUsersList;
  const q = String(query).toLowerCase().trim();
  return allUsersList.filter(u =>
    String(u.id).includes(q) ||
    (u.name || '').toLowerCase().includes(q) ||
    (u.username || '').toLowerCase().includes(q)
  );
}

// ============================================================
// RENDER USERS LIST — БО РАСМҲО
// ============================================================
function renderUsersList(users) {
  const list = document.getElementById('adminUsersList');
  if (!list) return;

  if (!users.length) {
    list.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-2);font-size:12px">Корбар ёфт нашуд</div>`;
    return;
  }

  list.innerHTML = users.slice(0, 100).map(u => {
    const isSelected = selectedUser && Number(selectedUser.id) === Number(u.id);
    const hasPremium = u.isPremium && u.premiumExpiresAt && Date.now() < u.premiumExpiresAt;
    const initial = (u.name || 'U').charAt(0).toUpperCase();
    const hasPhoto = u.photo && typeof u.photo === 'string' && u.photo.length > 10;

    const avatarHTML = hasPhoto
      ? `
        <div style="
          width:38px;height:38px;border-radius:50%;overflow:hidden;flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ${hasPremium ? 'border:2px solid #fbbf24;' : 'border:2px solid transparent;'}
          box-sizing:content-box;
        ">
          <img src="${u.photo}" alt="${escapeHtmlLocal(u.name || 'U')}"
            style="width:100%;height:100%;object-fit:cover;display:block;"
            onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px\\'>${escapeHtmlLocal(initial)}</div>'">
        </div>
      `
      : `
        <div style="
          width:38px;height:38px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:15px;
          ${hasPremium ? 'border:2px solid #fbbf24;' : 'border:2px solid transparent;'}
          box-sizing:content-box;
        ">${escapeHtmlLocal(initial)}</div>
      `;

    return `
      <div onclick="selectAdminUser(${u.id})" style="
        display:flex;align-items:center;gap:10px;padding:10px 12px;
        background:${isSelected ? 'rgba(99,102,241,0.18)' : 'var(--bg-2)'};
        border:1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'};
        border-radius:12px;cursor:pointer;transition:all 0.2s;
      ">
        ${avatarHTML}
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${escapeHtmlLocal(u.name || 'Корбар')} ${hasPremium ? '👑' : ''}
          </div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ID: ${u.id}${u.username ? ' · @' + escapeHtmlLocal(u.username) : ''}
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#fbbf24;flex-shrink:0">${u.totalScore || 0}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// SELECT USER
// ============================================================
function selectAdminUser(userId) {
  const u = allUsersList.find(x => Number(x.id) === Number(userId));
  if (!u) return;
  selectedUser = u;

  const box = document.getElementById('adminSelectedUser');
  const nameEl = document.getElementById('adminSelectedName');
  const statusEl = document.getElementById('adminSelectedStatus');

  if (box) box.style.display = 'block';
  if (nameEl) nameEl.textContent = `${u.name || 'Корбар'} (ID: ${u.id})`;

  if (statusEl) {
    const hasPremium = u.isPremium && u.premiumExpiresAt && Date.now() < u.premiumExpiresAt;
    if (hasPremium) {
      const days = Math.ceil((u.premiumExpiresAt - Date.now()) / 86400000);
      statusEl.innerHTML = `👑 Premium фаъол — ${days} рӯз боқӣ`;
      statusEl.style.color = '#fbbf24';
    } else {
      statusEl.textContent = 'Free корбар';
      statusEl.style.color = 'var(--text-2)';
    }
  }

  const q = document.getElementById('adminUserSearch')?.value || '';
  renderUsersList(filterUsers(q));
}

// ============================================================
// GIVE PREMIUM
// ============================================================
async function givePremiumToSelectedUser() {
  if (!selectedUser) {
    showToast('Корбарро интихоб кунед');
    return;
  }

  const planKey = document.getElementById('adminPlanSelect')?.value || '1month';
  const plan = PREMIUM_PLANS_ADMIN[planKey];
  if (!plan) return;

  if (!confirm(`Ба ${selectedUser.name} (ID: ${selectedUser.id}) Premium дода шавад?\nНақша: ${plan.label}`)) return;

  try {
    await givePremiumToUser(selectedUser.id, planKey, plan.days);
    showToast(`✅ Premium дода шуд: ${selectedUser.name}`);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
    }
  } catch (e) {
    console.error('Give premium error:', e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// REMOVE PREMIUM — БЕ ТОЗАКУНИИ КЭШ
// ============================================================
async function removePremiumFromSelectedUser() {
  if (!selectedUser) {
    showToast('Корбарро интихоб кунед');
    return;
  }

  if (!confirm(
    `Premium аз ${selectedUser.name} (ID: ${selectedUser.id}) гирифта шавад?\n\n` +
    `Дарсҳои нав қулф мешаванд, аммо дарсҳои кушодашуда кушода мемонанд.`
  )) return;

  try {
    await removePremiumFromUser(selectedUser.id);
    showToast(`❌ Premium гирифта шуд: ${selectedUser.name}`);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
    }
  } catch (e) {
    console.error('Remove premium error:', e);
    alert('Хато: ' + e.message);
  }
}

// ============================================================
// LISTEN — Фармоишҳои pending
// ============================================================
function startOrdersListener() {
  if (typeof listenPremiumOrders !== 'function') {
    setTimeout(startOrdersListener, 1000);
    return;
  }

  listenPremiumOrders(orders => {
    currentOrders = orders;
    renderPremiumOrders(orders);
  });
}

// ============================================================
// RENDER — Рӯйхати фармоишҳо
// ============================================================
function renderPremiumOrders(orders) {
  let container = document.getElementById('adminOrders');
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
    <div style="
      display:inline-block;padding:4px 12px;background:rgba(251,191,36,0.15);
      color:#fbbf24;border-radius:20px;font-size:11px;font-weight:800;
      margin-bottom:12px;
    ">🔔 ${orders.length} фармоиши нав</div>
    ${orders.map(order => orderCardHTML(order)).join('')}
  `;
}

function orderCardHTML(order) {
  const initial = (order.userName || 'U').charAt(0).toUpperCase();
  const date = new Date(order.createdAt).toLocaleString('tg-TJ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  // Ҷустуҷӯи расми корбар дар рӯйхат
  const orderUser = allUsersList.find(u => Number(u.id) === Number(order.userId));
  const userPhoto = orderUser?.photo;
  const hasPhoto = userPhoto && typeof userPhoto === 'string' && userPhoto.length > 10;

  const avatarHTML = hasPhoto
    ? `
      <div style="
        width:44px;height:44px;border-radius:50%;overflow:hidden;flex-shrink:0;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      ">
        <img src="${userPhoto}" alt="${escapeHtmlLocal(order.userName || 'U')}"
          style="width:100%;height:100%;object-fit:cover;display:block;"
          onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px\\'>${escapeHtmlLocal(initial)}</div>'">
      </div>
    `
    : `
      <div style="
        width:44px;height:44px;border-radius:50%;flex-shrink:0;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        color:#fff;display:flex;align-items:center;justify-content:center;
        font-weight:800;font-size:18px;
      ">${escapeHtmlLocal(initial)}</div>
    `;

  return `
    <div class="order-card" style="
      background:var(--bg-2);border:1px solid var(--card-border);
      border-radius:16px;padding:14px;margin-bottom:12px;
    ">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        ${avatarHTML}
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${escapeHtmlLocal(order.userName || 'Корбар')}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            ID: ${order.userId} · ${order.userUsername ? '@' + escapeHtmlLocal(order.userUsername) : '—'}
          </div>
        </div>
      </div>

      <div style="
        display:grid;grid-template-columns:1fr 1fr;gap:8px;
        padding:10px 12px;background:rgba(99,102,241,0.08);
        border-radius:10px;margin-bottom:12px;
      ">
        <div style="font-size:12px;color:var(--text-2)">
          📦 <strong style="color:var(--text)">${escapeHtmlLocal(order.planLabel)}</strong>
        </div>
        <div style="font-size:12px;color:var(--text-2);text-align:right">
          💰 <strong style="color:#fbbf24">${order.planPrice} с.</strong>
        </div>
        <div style="font-size:11px;color:var(--text-2);grid-column:1/-1">
          ⏱ ${date}
        </div>
      </div>

      ${order.photo ? `
        <div style="margin-bottom:12px;cursor:pointer" onclick="viewPhotoFull('${order.id}')">
          <img src="${order.photo}" style="
            width:100%;border-radius:12px;max-height:220px;
            object-fit:cover;background:#0f172a;display:block;
          " onerror="this.style.display='none'">
          <div style="text-align:center;font-size:11px;color:var(--text-2);margin-top:6px">
            👆 Пахш кунед, то калон кушоед
          </div>
        </div>
      ` : `
        <div style="padding:20px;background:rgba(148,163,184,0.08);border-radius:10px;
          text-align:center;font-size:12px;color:var(--text-2);margin-bottom:12px">
          📷 Расм нест
        </div>
      `}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button onclick="approveOrder('${order.id}', ${order.userId}, '${order.plan}', ${order.planDays || 30})"
          style="padding:12px;background:linear-gradient(135deg,#10b981,#059669);
            color:#fff;border:none;border-radius:12px;font-weight:700;
            font-size:13px;cursor:pointer;font-family:inherit;">
          ✅ Қабул
        </button>
        <button onclick="rejectOrder('${order.id}', ${order.userId})"
          style="padding:12px;background:linear-gradient(135deg,#ef4444,#dc2626);
            color:#fff;border:none;border-radius:12px;font-weight:700;
            font-size:13px;cursor:pointer;font-family:inherit;">
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
  viewer.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:20px;
  `;
  viewer.innerHTML = `
    <img src="${order.photo}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;">
    <button onclick="document.getElementById('photoViewer').remove()" style="
      position:absolute;top:20px;right:20px;width:44px;height:44px;
      border-radius:12px;background:rgba(255,255,255,0.15);
      color:#fff;border:none;font-size:22px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
    ">✕</button>
  `;
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.remove(); });
  document.body.appendChild(viewer);
}

// ============================================================
// APPROVE / REJECT ORDER
// ============================================================
async function approveOrder(orderId, userId, plan, days) {
  if (!confirm(`Қабули фармоиш?\nКорбар ID: ${userId}\nНақша: ${plan} (${days} рӯз)`)) return;

  try {
    await approveOrderInFirebase(orderId, userId, plan, days);
    showToast('✅ Фармоиш қабул шуд');
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
    }
  } catch (e) {
    console.error('Approve error:', e);
    alert('Хато: ' + e.message);
  }
}

async function rejectOrder(orderId, userId) {
  const reason = prompt('Сабаби радкунӣ:', 'Скриншот нодуруст');
  if (reason === null) return;

  try {
    await rejectOrderInFirebase(orderId, userId, reason);
    showToast('❌ Фармоиш рад шуд');
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

window.addEventListener('load', () => setTimeout(initAdminPanel, 2000));
