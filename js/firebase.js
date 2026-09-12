// ============================================================
// FIREBASE — Рейтинги воқеӣ
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

// Firebase SDK аллакай дар HTML бор шудааст
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.database();
  isFirebaseReady = true;
  console.log('✅ Firebase омода');

  if (typeof onFirebaseReady === 'function') {
    setTimeout(onFirebaseReady, 100);
  }
} catch (e) {
  console.error('❌ Firebase:', e);
}

// ============================================================
// САБТИ КОРБАР
// ============================================================
function saveUserToFirebase(userData) {
  if (!isFirebaseReady || !userData.id) return;
  db.ref('users/' + userData.id).update({
    id: userData.id,
    name: userData.name,
    username: userData.username || null,
    photo: userData.photo || null,
    lessonsCount: userData.lessonsCount,
    avgScore: userData.avgScore,
    totalScore: userData.totalScore,
    isPremium: userData.isPremium,
    isAdmin: userData.isAdmin,
    lastActive: firebase.database.ServerValue.TIMESTAMP
  }).catch(err => console.error('Firebase save error:', err));
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
    db.ref('users').off('value', ratingListener);
  }

  console.log('🏆 Firebase рейтинг бор мешавад...');

  ratingListener = db.ref('users')
    .orderByChild('totalScore')
    .limitToLast(100)
    .on('value', snapshot => {
      const users = [];
      snapshot.forEach(child => users.push(child.val()));
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
  if (!isFirebaseReady) {
    callback(null);
    return;
  }
  db.ref('users/' + userId).once('value').then(snapshot => {
    callback(snapshot.val());
  });
}

// ============================================================
// 🎧 PREMIUM SYNC
// ============================================================
let myPremiumListener = null;

function listenMyPremiumFromFirebase(userId, callback) {
  if (!isFirebaseReady || !userId) return;

  if (myPremiumListener) {
    db.ref('users/' + userId).off('value', myPremiumListener);
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
  }, err => console.error('Premium listener error:', err));
}

// ============================================================
// 🔔 NOTIFICATIONS
// ============================================================
let notifListener = null;

function listenMyNotifications(userId, callback) {
  if (!isFirebaseReady || !userId) return;

  if (notifListener) {
    db.ref('notifications/' + userId).off('child_added', notifListener);
  }

  notifListener = db.ref('notifications/' + userId)
    .orderByChild('createdAt')
    .limitToLast(5)
    .on('child_added', snap => {
      const notif = snap.val();
      if (!notif || notif.read) return;
      notif.id = snap.key;
      callback(notif);
    });
}
