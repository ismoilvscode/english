// ============================================================
// FIREBASE — Рейтинги воқеӣ + Premium Sync + Notifications
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
      } else if (tries > 30) {
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
  }).catch(err => console.error('❌ Firebase save error:', err));
}

// ============================================================
// ХОНДАНИ РЕЙТИНГ
// ============================================================
function fetchRatingFromFirebase(callback, limit = 100) {
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
// РЕЙТИНГ REAL-TIME
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
    .limitToLast(100)
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
// 🔎 ADMIN — Ҷустуҷӯи корбар бо ID
// ============================================================
async function fetchUserById(userId, callback) {
  if (!isFirebaseReady || !db) { callback(null); return; }
  try {
    const snap = await db.ref('users/' + userId).once('value');
    callback(snap.exists() ? snap.val() : null);
  } catch (e) {
    console.error('fetchUserById error:', e);
    callback(null);
  }
}

// ============================================================
// 🔎 ADMIN — Ҷустуҷӯи корбар бо @username
// ============================================================
async function findUserByUsername(username, callback) {
  if (!isFirebaseReady || !db) { callback(null); return; }
  try {
    const clean = String(username).replace(/^@/, '').toLowerCase();
    const snap = await db.ref('users').once('value');
    let found = null;
    snap.forEach(child => {
      const v = child.val();
      if (v && v.username && String(v.username).toLowerCase() === clean) {
        found = { ...v, _key: child.key };
      }
    });
    callback(found);
  } catch (e) {
    console.error('findUserByUsername error:', e);
    callback(null);
  }
}

// ============================================================
// 🎧 PREMIUM SYNC (бо auto-cache clearing)
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

console.log('📦 firebase.js бор шуд');
