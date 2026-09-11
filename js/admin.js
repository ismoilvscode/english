// ============================================================
// ADMIN PANEL — Premium Orders Management
// ============================================================
const ADMIN_ID_LOCAL = 8406121228;
const user_admin = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
const IS_ADMIN_LOCAL = Number(user_admin.id) === ADMIN_ID_LOCAL;

let currentOrders = [];

// ============================================================
// INIT
// ============================================================
function initAdminPanel() {
  if (!IS_ADMIN_LOCAL) return;

  // Тугмаҳои амалҳои админ
  document.querySelectorAll('[data-admin-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.adminAction;

      if (action === 'give-premium') {
        const plan = document.getElementById('adminPlanSelect').value;
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
        showToast('Premium нест шуд');
        setTimeout(() => location.reload(), 1000);
      }
    });
  });

  startOrdersListener();
  console.log('✅ Admin Panel омода');
}

// ============================================================
// LISTEN — Фармоишҳои pending
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

  return `
    <div class="order-card" style="
      background:var(--bg-2);
      border:1px solid var(--card-border);
      border-radius:16px;
      padding:14px;
      margin-bottom:12px;
    ">
      <!-- User -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="
          width:44px;height:44px;border-radius:12px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:18px;flex-shrink:0;
        ">${escapeHtmlLocal(initial)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${escapeHtmlLocal(order.userName || 'Корбар')}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            ID: ${order.userId} · ${order.userUsername ? '@' + escapeHtmlLocal(order.userUsername) : '—'}
          </div>
        </div>
      </div>

      <!-- Info -->
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

      <!-- Photo -->
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

      <!-- Buttons -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button onclick="approveOrder('${order.id}', ${order.userId}, '${order.plan}', ${order.planDays || 30})" 
          style="
            padding:12px;background:linear-gradient(135deg,#10b981,#059669);
            color:#fff;border:none;border-radius:12px;font-weight:700;
            font-size:13px;cursor:pointer;font-family:inherit;
          ">
          ✅ Қабул
        </button>
        <button onclick="rejectOrder('${order.id}', ${order.userId})"
          style="
            padding:12px;background:linear-gradient(135deg,#ef4444,#dc2626);
            color:#fff;border:none;border-radius:12px;font-weight:700;
            font-size:13px;cursor:pointer;font-family:inherit;
          ">
          ❌ Рад
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// PHOTO FULLSCREEN VIEWER
// ============================================================
function viewPhotoFull(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order || !order.photo) return;

  const existing = document.getElementById('photoViewer');
  if (existing) existing.remove();

  const viewer = document.createElement('div');
  viewer.id = 'photoViewer';
  viewer.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:20px;
  `;
  viewer.innerHTML = `
    <img src="${order.photo}" style="
      max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;
    ">
    <button onclick="document.getElementById('photoViewer').remove()" style="
      position:absolute;top:20px;right:20px;width:44px;height:44px;
      border-radius:12px;background:rgba(255,255,255,0.15);
      color:#fff;border:none;font-size:22px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
    ">✕</button>
  `;
  viewer.addEventListener('click', e => {
    if (e.target === viewer) viewer.remove();
  });
  document.body.appendChild(viewer);
}

// ============================================================
// APPROVE ORDER
// ============================================================
async function approveOrder(orderId, userId, plan, days) {
  if (!confirm(`Қабули фармоиш?\nКорбар ID: ${userId}\nНақша: ${plan} (${days} рӯз)`)) return;

  try {
    const expiresAt = Date.now() + days * 86400000;

    // 1. Update order status
    await db.ref('premium_orders/' + orderId).update({
      status: 'approved',
      approvedAt: Date.now(),
      approvedBy: user_admin.id || ADMIN_ID_LOCAL
    });

    // 2. Premium ба корбар
    await db.ref('users/' + userId).update({
      isPremium: true,
      premiumPlan: plan,
      premiumStartedAt: Date.now(),
      premiumExpiresAt: expiresAt
    });

    // 3. Notification
    await db.ref('notifications/' + userId).push({
      type: 'premium_approved',
      plan: plan,
      days: days,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      read: false
    });

    showToast('✅ Фармоиш қабул шуд');
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
    }
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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
    }
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

window.addEventListener('load', () => setTimeout(initAdminPanel, 2000));
