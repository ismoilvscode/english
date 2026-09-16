// ============================================================
// FIREBASE — v9
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

(function initFirebase() {
  try {
    if (typeof firebase === 'undefined') { console.error('❌ Firebase SDK нест'); return; }
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    isFirebaseReady = true;
    console.log('✅ Firebase омода');

    let tries = 0;
    const wait = setInterval(() => {
      tries++;
      if (typeof onFirebaseReady === 'function') {
        clearInterval(wait);
        onFirebaseReady();
      } else if (tries > 50) clearInterval(wait);
    }, 100);
  } catch (e) { console.error('❌ Firebase:', e); }
})();

// ============================================================
// SAVE USER
// ============================================================
function saveUserToFirebase(userData) {
  if (!isFirebaseReady || !db || !userData?.id) return;
  db.ref('users/' + userData.id).update({
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
  }).catch(err => console.error('❌ Save:', err));
}

// ============================================================
// RATING REALTIME
// ============================================================
let ratingListener = null;

function listenRatingRealtime(callback) {
  if (!isFirebaseReady || !db) { callback([]); return; }
  if (ratingListener) { try { db.ref('users').off('value', ratingListener); } catch (e) {} }

  ratingListener = db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(50)
    .on('value', snapshot => {
      const users = [];
      snapshot.forEach(c => { const u = c.val(); if (u && u.id) users.push(u); });
      users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      callback(users);
    }, err => { console.error('❌ Rating:', err); callback([]); });
}

// ============================================================
// ALL USERS REALTIME (бо индекс — бе orderByChild)
// ============================================================
let allUsersListener = null;

function listenAllUsersRealtime(callback) {
  if (!isFirebaseReady || !db) { callback([]); return; }
  if (allUsersListener) { try { db.ref('users').off('value', allUsersListener); } catch (e) {} }

  allUsersListener = db.ref('users').on('value', snapshot => {
    const users = [];
    snapshot.forEach(c => { const u = c.val(); if (u && u.id) users.push(u); });
    users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    console.log(`⚡ ${users.length} корбарон`);
    callback(users);
  }, err => { console.error('❌ AllUsers:', err); callback([]); });
}

// ============================================================
// FETCH USER
// ============================================================
function fetchUserFromFirebase(userId, callback) {
  if (!isFirebaseReady || !db) { callback(null); return; }
  db.ref('users/' + userId).once('value')
    .then(s => callback(s.val()))
    .catch(() => callback(null));
}

// ============================================================
// PREMIUM SYNC
// ============================================================
let myPremiumListener = null;

function listenMyPremiumFromFirebase(userId, callback) {
  if (!isFirebaseReady || !db || !userId) return;
  if (myPremiumListener) { try { db.ref('users/' + userId).off('value', myPremiumListener); } catch (e) {} }

  myPremiumListener = db.ref('users/' + userId).on('value', snap => {
    const data = snap.val();
    if (!data) return;
    callback({
      isPremium: !!data.isPremium,
      premiumPlan: data.premiumPlan || null,
      premiumStartedAt: data.premiumStartedAt || null,
      premiumExpiresAt: data.premiumExpiresAt || null
    });
  }, err => console.error('❌ Premium:', err));
}

// ============================================================
// NOTIFICATIONS
// ============================================================
let notifListener = null;

function listenMyNotifications(userId, callback) {
  if (!isFirebaseReady || !db || !userId) return;
  if (notifListener) { try { db.ref('notifications/' + userId).off('child_added', notifListener); } catch (e) {} }

  notifListener = db.ref('notifications/' + userId)
    .orderByChild('createdAt')
    .limitToLast(10)
    .on('child_added', snap => {
      const notif = snap.val();
      if (!notif || notif.read) return;
      notif.id = snap.key;
      callback(notif);
    }, err => console.error('❌ Notif:', err));
}

// ============================================================
// ORDERS REALTIME
// ============================================================
let ordersListener = null;

function listenPremiumOrders(callback) {
  if (!isFirebaseReady || !db) { callback([]); return; }
  if (ordersListener) { try { db.ref('premium_orders').off('value', ordersListener); } catch (e) {} }

  ordersListener = db.ref('premium_orders').on('value', snap => {
    const orders = [];
    snap.forEach(c => {
      const v = c.val();
      if (v && v.status === 'pending') orders.push({ id: c.key, ...v });
    });
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(orders);
  }, err => { console.error('❌ Orders:', err); callback([]); });
}

// ============================================================
// ADMIN HELPERS
// ============================================================
async function givePremiumToUser(userId, planKey, days) {
  if (!isFirebaseReady || !db || !userId) throw new Error('Firebase нест');
  const expiresAt = Date.now() + days * 86400000;

  await db.ref('users/' + userId).update({
    isPremium: true, premiumPlan: planKey,
    premiumStartedAt: Date.now(), premiumExpiresAt: expiresAt
  });

  await db.ref('notifications/' + userId).push({
    type: 'premium_approved', plan: planKey, days: days,
    expiresAt: expiresAt, createdAt: Date.now(), read: false
  });
}

async function removePremiumFromUser(userId) {
  if (!isFirebaseReady || !db || !userId) throw new Error('Firebase нест');
  await db.ref('users/' + userId).update({
    isPremium: false, premiumPlan: null,
    premiumStartedAt: null, premiumExpiresAt: null
  });
  await db.ref('notifications/' + userId).push({
    type: 'premium_revoked', createdAt: Date.now(), read: false
  });
}

console.log('📦 firebase.js v9 бор шуд');
