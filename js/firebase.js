// ============================================================
// FIREBASE — Рейтинги воқеӣ + Premium Sync + Notifications
// APP_VERSION: 7
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyADKhYDf1dc11VJHmFdT26irHHBUt_Lkrk",
  authDomain: "my-projekt-d246d.firebaseapp.com",
  databaseURL: "https://my-projekt-d246d-default-rtdb.firebaseio.com",
  projectId: "my-projekt-d246d",
  storageBucket: "my-projekt-d246d.firebasestorage.app",
  messagingSenderId: "149204965139",
  appId: "1:149204965139:web:b4c1bc35b4a373cddc2ce6"
};

let db = null;
let isFirebaseReady = false;

// ============================================================
// INIT
// ============================================================
(function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK бор нашуд');
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.database();
    isFirebaseReady = true;

    console.log('✅ Firebase омода');
    console.log('✅ databaseURL:', firebaseConfig.databaseURL);

    let tries = 0;
    const wait = setInterval(() => {
      tries++;
      if (typeof onFirebaseReady === 'function') {
        clearInterval(wait);
        console.log('🚀 onFirebaseReady даъват мешавад');
        onFirebaseReady();
      } else if (tries > 50) {
        clearInterval(wait);
        console.warn('⚠️ onFirebaseReady ёфт нашуд');
      }
    }, 100);

  } catch (e) {
    console.error('❌ Firebase:', e);
  }
})();

// ============================================================
// САБТИ КОРБАР
// ============================================================
function saveUserToFirebase(userData) {
  if (!isFirebaseReady || !db || !userData || !userData.id) return;

  const payload = {
    id: userData.id,
    name: userData.name || 'Корбар',
    username: userData.username || null,
    photo: userData.photo || null,
    lessonsCount: userData.lessonsCount || 0,
    avgScore: userData.avgScore || 0,
    totalScore: userData.totalScore || 0,
    isPremium: !!userData.isPremium,
    isAdmin: !!userData.isAdmin,
    lastActive: firebase.database.ServerValue.TIMESTAMP
  };

  db.ref('users/' + userData.id).update(payload)
    .catch(err => console.error('❌ Firebase save error:', err));
}

// ============================================================
// ХОНДАНИ РЕЙТИНГ (якдафъа)
// ============================================================
function fetchRatingFromFirebase(callback, limit = 50) {
  if (!isFirebaseReady || !db) {
    callback([]);
    return;
  }

  db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(limit)
    .once('value')
    .then(snapshot => {
      const users = [];
      snapshot.forEach(child => {
        const u = child.val();
        if (u && u.id) users.push(u);
      });
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      callback(users);
    })
    .catch(err => {
      console.error('❌ Firebase read error:', err);
      callback([]);
    });
}

// ============================================================
// РЕЙТИНГ REAL-TIME — БАРОИ САҲИФАИ РЕЙТИНГ
// ============================================================
let ratingListener = null;

function listenRatingRealtime(callback) {
  if (!isFirebaseReady || !db) {
    console.warn('⚠️ Firebase нест');
    callback([]);
    return;
  }

  if (ratingListener) {
    try {
      db.ref('users').off('value', ratingListener);
    } catch (e) {
      console.warn('Listener off error:', e);
    }
  }

  console.log('🏆 Firebase рейтинг бор мешавад...');

  ratingListener = db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(50)
    .on('value', snapshot => {
      const users = [];
      snapshot.forEach(child => {
        const u = child.val();
        if (u && u.id) users.push(u);
      });
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      console.log('🏆 Firebase users:', users.length);
      callback(users);
    }, err => {
      console.error('❌ Firebase listen error:', err);
      callback([]);
    });
}

// ============================================================
// ⚡ БОРКУНИИ ТЕЗИ ҲАМАИ КОРБАРОН (барои ADMIN)
// Бе orderByChild — хеле тезтар!
// ============================================================
let allUsersListener = null;

function listenAllUsersRealtime(callback) {
  if (!isFirebaseReady || !db) {
    callback([]);
    return;
  }

  if (allUsersListener) {
    try {
      db.ref('users').off('value', allUsersListener);
    } catch (e) {
      console.warn('All users listener off error:', e);
    }
  }

  console.log('⚡ Ҳамаи корбарон бор мешаванд (бе orderByChild)...');

  allUsersListener = db.ref('users').on('value', snapshot => {
    const users = [];
    snapshot.forEach(child => {
      const u = child.val();
      if (u && u.id) users.push(u);
    });
    users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    console.log(`⚡ ${users.length} корбарон бор шуданд`);
    callback(users);
  }, err => {
    console.error('❌ All users listener error:', err);
    callback([]);
  });
}

// ============================================================
// ГИРИФТАНИ ЯК КОРБАР
// ============================================================
function fetchUserFromFirebase(userId, callback) {
  if (!isFirebaseReady || !db) {
    callback(null);
    return;
  }

  db.ref('users/' + userId).once('value')
    .then(snapshot => callback(snapshot.val()))
    .catch(err => {
      console.error('❌ Firebase fetch user error:', err);
      callback(null);
    });
}

// ============================================================
// 🎧 PREMIUM SYNC
// ============================================================
let myPremiumListener = null;

function listenMyPremiumFromFirebase(userId, callback) {
  if (!isFirebaseReady || !db || !userId) return;

  if (myPremiumListener) {
    try {
      db.ref('users/' + userId).off('value', myPremiumListener);
    } catch (e) {
      console.warn('Premium listener off error:', e);
    }
  }

  myPremiumListener = db.ref('users/' + userId).on('value', snap => {
    const data = snap.val();
    if (!data) return;

    callback({
      isPremium: !!data.isPremium,
      premiumPlan: data.premiumPlan || null,
      premiumStartedAt: data.premiumStartedAt || null,
      premiumExpiresAt: data.premiumExpiresAt || null
    });
  }, err => {
    console.error('❌ Premium listener error:', err);
  });
}

// ============================================================
// 🔔 NOTIFICATIONS
// ============================================================
let notifListener = null;

function listenMyNotifications(userId, callback) {
  if (!isFirebaseReady || !db || !userId) return;

  if (notifListener) {
    try {
      db.ref('notifications/' + userId).off('child_added', notifListener);
    } catch (e) {
      console.warn('Notif listener off error:', e);
    }
  }

  notifListener = db.ref('notifications/' + userId)
    .orderByChild('createdAt')
    .limitToLast(10)
    .on('child_added', snap => {
      const notif = snap.val();
      if (!notif || notif.read) return;
      notif.id = snap.key;
      callback(notif);
    }, err => {
      console.error('❌ Notifications listener error:', err);
    });
}

// ============================================================
// 🛑 ADMIN HELPERS
// ============================================================

// Додани Premium ба корбар
async function givePremiumToUser(userId, planKey, days) {
  if (!isFirebaseReady || !db || !userId) {
    throw new Error('Firebase пайваст нест');
  }

  const expiresAt = Date.now() + days * 86400000;

  await db.ref('users/' + userId).update({
    isPremium: true,
    premiumPlan: planKey,
    premiumStartedAt: Date.now(),
    premiumExpiresAt: expiresAt
  });

  await db.ref('notifications/' + userId).push({
    type: 'premium_approved',
    plan: planKey,
    days: days,
    expiresAt: expiresAt,
    createdAt: Date.now(),
    read: false
  });

  console.log(`✅ Premium дода шуд: user ${userId}, ${days} рӯз`);
  return expiresAt;
}

// Гирифтани Premium — БЕ ТОЗАКУНИИ КЭШ
async function removePremiumFromUser(userId) {
  if (!isFirebaseReady || !db || !userId) {
    throw new Error('Firebase пайваст нест');
  }

  await db.ref('users/' + userId).update({
    isPremium: false,
    premiumPlan: null,
    premiumStartedAt: null,
    premiumExpiresAt: null
  });

  await db.ref('notifications/' + userId).push({
    type: 'premium_revoked',
    createdAt: Date.now(),
    read: false
  });

  console.log(`❌ Premium гирифта шуд: user ${userId}`);
}

// Қабули фармоиш
async function approveOrderInFirebase(orderId, userId, plan, days) {
  if (!isFirebaseReady || !db) {
    throw new Error('Firebase пайваст нест');
  }

  const expiresAt = Date.now() + days * 86400000;

  await db.ref('premium_orders/' + orderId).update({
    status: 'approved',
    approvedAt: Date.now()
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

  console.log(`✅ Фармоиш қабул шуд: ${orderId}`);
}

// Рад кардани фармоиш
async function rejectOrderInFirebase(orderId, userId, reason) {
  if (!isFirebaseReady || !db) {
    throw new Error('Firebase пайваст нест');
  }

  await db.ref('premium_orders/' + orderId).update({
    status: 'rejected',
    rejectedAt: Date.now(),
    rejectReason: reason || 'Сабаб нишон дода нашуд'
  });

  await db.ref('notifications/' + userId).push({
    type: 'premium_rejected',
    reason: reason,
    createdAt: Date.now(),
    read: false
  });

  console.log(`❌ Фармоиш рад шуд: ${orderId}`);
}

// ============================================================
// 📊 ОБУНА БА ФАРМОИШҲО (барои admin)
// ============================================================
let ordersListener = null;

function listenPremiumOrders(callback) {
  if (!isFirebaseReady || !db) {
    callback([]);
    return;
  }

  if (ordersListener) {
    try {
      db.ref('premium_orders').off('value', ordersListener);
    } catch (e) {
      console.warn('Orders listener off error:', e);
    }
  }

  ordersListener = db.ref('premium_orders').on('value', snap => {
    const orders = [];
    snap.forEach(child => {
      const val = child.val();
      if (val && val.status === 'pending') {
        orders.push({ id: child.key, ...val });
      }
    });
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(orders);
  }, err => {
    console.error('❌ Orders listener error:', err);
    callback([]);
  });
}

// ============================================================
// LOG
// ============================================================
console.log('📦 firebase.js бор шуд (v7)');
